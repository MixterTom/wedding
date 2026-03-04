import { useEffect, useRef, useState } from 'react'
import './App.css'

const MUSIC_URL =
  'https://statics.pancake.vn/web-media/30/2d/16/de/6ef7c8fcf6b86241ef11f111d6d3269a74a27c5ab5a451854d150895-w:0-h:0-l:2426583-t:audio/mpeg.mp3'

// Cloudinary config (chỉ dùng public URL, không để lộ api_key / secret ở frontend)
const CLOUDINARY_BASE =
  'https://res.cloudinary.com/dko2gxv0s/image/upload/f_auto,q_auto'

// Các biến môi trường cho upload ảnh (cấu hình trong .env.local)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dko2gxv0s'
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '558998346157935'
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || 'MZxCB35HsxuQej-vHmEjna1fBDg'
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

// Key để lưu mapping ảnh trong localStorage
const STORAGE_KEY = 'wedding_image_mapping'

// Type cho image mapping
type ImageMapping = {
  [originalPath: string]: {
    publicId: string
    url: string
  }
}

// Hàm lấy image mapping từ localStorage
function getImageMapping(): ImageMapping {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Hàm lưu image mapping vào localStorage
function saveImageMapping(mapping: ImageMapping) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping))
  } catch (err) {
    console.error('Lỗi khi lưu vào localStorage:', err)
  }
}

// Hàm lấy URL ảnh (ưu tiên Cloudinary nếu có trong localStorage)
function getImageUrl(originalPath: string): string {
  const mapping = getImageMapping()
  const mapped = mapping[originalPath]
  if (mapped?.publicId) {
    // Tự động build URL từ public_id + CLOUDINARY_BASE
    return `${CLOUDINARY_BASE}/${mapped.publicId}`
  }
  return originalPath
}

// Hàm lưu mapping sau khi upload
function saveImageMappingAfterUpload(originalPath: string, publicId: string, url: string) {
  const mapping = getImageMapping()
  mapping[originalPath] = { publicId, url }
  saveImageMapping(mapping)
}

// Hàm tính signature cho Cloudinary (dùng Web Crypto API)
async function generateSignature(params: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(params)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Hàm resize và compress ảnh nếu quá lớn
async function compressImage(file: File, maxSizeMB: number = 10): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024 // 10MB = 10485760 bytes

  // Nếu file nhỏ hơn max size, không cần compress
  if (file.size <= maxSizeBytes) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        let quality = 0.9

        // Tính toán kích thước mới để giảm dung lượng
        // Giảm dần kích thước và quality cho đến khi đạt yêu cầu
        const maxDimension = 2048 // Giới hạn chiều rộng/cao tối đa

        // Nếu ảnh quá lớn, resize xuống
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Không thể tạo canvas context'))
          return
        }

        // Vẽ ảnh lên canvas với kích thước mới
        ctx.drawImage(img, 0, 0, width, height)

        // Thử compress với các mức quality khác nhau
        const tryCompress = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Không thể tạo blob từ canvas'))
                return
              }

              // Nếu đã đạt yêu cầu hoặc quality quá thấp, dừng lại
              if (blob.size <= maxSizeBytes || currentQuality <= 0.3) {
                const compressedFile = new File(
                  [blob],
                  file.name,
                  {
                    type: file.type || 'image/jpeg',
                    lastModified: Date.now()
                  }
                )
                resolve(compressedFile)
              } else {
                // Giảm quality và thử lại
                tryCompress(currentQuality - 0.1)
              }
            },
            file.type || 'image/jpeg',
            currentQuality
          )
        }

        tryCompress(quality)
      }
      img.onerror = () => reject(new Error('Không thể load ảnh'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Không thể đọc file'))
    reader.readAsDataURL(file)
  })
}

async function uploadToCloudinary(
  file: File,
  originalPath: string
): Promise<{ url: string; publicId: string } | null> {
  if (!CLOUDINARY_CLOUD_NAME) {
    alert('Chưa cấu hình Cloudinary Cloud Name!')
    return null
  }

  // Kiểm tra và compress ảnh nếu quá lớn (>10MB)
  let fileToUpload = file
  const maxSizeMB = 10 // 10MB = 10485760 bytes

  if (file.size > maxSizeMB * 1024 * 1024) {
    try {
      // Hiển thị thông báo đang compress
      console.log(`File quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB), đang tự động giảm kích thước...`)

      fileToUpload = await compressImage(file, maxSizeMB)

      console.log(`Đã giảm xuống ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`)
    } catch (err) {
      console.error('Lỗi khi compress ảnh:', err)
      alert(`File quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB) và không thể tự động giảm kích thước. Vui lòng chọn ảnh nhỏ hơn 10MB.`)
      return null
    }
  }

  const formData = new FormData()
  formData.append('file', fileToUpload)

  // Nếu có upload preset, dùng unsigned upload (khuyến nghị cho frontend)
  if (CLOUDINARY_UPLOAD_PRESET) {
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  } else if (CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    // Nếu không có preset, dùng API Key và Secret (cần tính signature)
    // Lưu ý: Cách này không an toàn cho production vì Secret bị expose
    formData.append('api_key', CLOUDINARY_API_KEY)

    // Tính timestamp
    const timestamp = Math.round(new Date().getTime() / 1000)
    formData.append('timestamp', timestamp.toString())

    // Tính signature (cần dùng crypto để hash)
    // Vì frontend không có crypto an toàn, mình sẽ dùng Web Crypto API
    const paramsToSign = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
    const signature = await generateSignature(paramsToSign)
    formData.append('signature', signature)
  } else {
    alert(
      'Chưa cấu hình Cloudinary!\n\n' +
      'Cần một trong hai:\n' +
      '1. VITE_CLOUDINARY_UPLOAD_PRESET (khuyến nghị - unsigned preset)\n' +
      '2. VITE_CLOUDINARY_API_KEY + VITE_CLOUDINARY_API_SECRET\n\n' +
      'Vui lòng tạo file .env.local và restart dev server.'
    )
    return null
  }

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const errorText = await res.text()
      let errorMessage = 'Upload lên Cloudinary thất bại.\n\n'

      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage += `Lỗi: ${errorData.error.message}\n\n`

          if (errorData.error.message.includes('cloud_name is disabled')) {
            errorMessage +=
              'Cloud name bị vô hiệu hóa hoặc không tồn tại.\n' +
              'Vui lòng kiểm tra:\n' +
              '1. Đăng nhập Cloudinary Dashboard\n' +
              '2. Kiểm tra Cloud name trong Settings → General\n' +
              '3. Đảm bảo Cloud name đúng và đang hoạt động\n' +
              `4. Hiện tại đang dùng: "${CLOUDINARY_CLOUD_NAME}"`
          } else if (errorData.error.message.includes('upload_preset')) {
            errorMessage +=
              'Upload preset không hợp lệ.\n' +
              'Vui lòng kiểm tra:\n' +
              '1. Settings → Upload → Upload presets\n' +
              '2. Tạo preset mới với Signing mode = "Unsigned"\n' +
              `3. Đảm bảo tên preset đúng: "${CLOUDINARY_UPLOAD_PRESET}"`
          }
        }
      } catch {
        errorMessage += `Chi tiết: ${errorText}`
      }

      console.error('Cloudinary upload error:', errorText)
      alert(errorMessage)
      return null
    }

    const data = (await res.json()) as { secure_url?: string; public_id?: string }
    if (!data.secure_url || !data.public_id) {
      alert('Upload thành công nhưng không nhận được URL hoặc public_id.')
      return null
    }

    const publicId = data.public_id
    const url = data.secure_url

    // Tự động lưu vào localStorage
    saveImageMappingAfterUpload(originalPath, publicId, url)

    return { url, publicId }
  } catch (err) {
    console.error('Cloudinary upload exception', err)
    alert(`Có lỗi khi upload lên Cloudinary:\n${err instanceof Error ? err.message : String(err)}`)
    return null
  }
}

type EditableImageProps = {
  initialSrc: string
  alt: string
  className?: string
  editMode: boolean
  label?: string
  loading?: 'lazy' | 'eager'
}

function EditableImage({ initialSrc, alt, className, editMode, label, loading }: EditableImageProps) {
  // Tự động load từ localStorage khi component mount
  const [src, setSrc] = useState(() => getImageUrl(initialSrc))
  const [uploading, setUploading] = useState(false)
  const [publicId, setPublicId] = useState<string | null>(() => {
    const mapping = getImageMapping()
    return mapping[initialSrc]?.publicId || null
  })
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Reload khi localStorage thay đổi (từ component khác)
  useEffect(() => {
    const handleImageUpdate = (e?: CustomEvent) => {
      // Nếu có event detail và match với initialSrc của component này, update ngay
      if (e?.detail?.originalPath === initialSrc) {
        const mapping = getImageMapping()
        const mapped = mapping[initialSrc]
        if (mapped?.publicId) {
          const cloudinaryUrl = `${CLOUDINARY_BASE}/${mapped.publicId}`
          setSrc(cloudinaryUrl)
          setPublicId(mapped.publicId)
        }
      } else {
        // Nếu không match hoặc không có detail, reload từ localStorage
        const newUrl = getImageUrl(initialSrc)
        setSrc(newUrl)
        const mapping = getImageMapping()
        setPublicId(mapping[initialSrc]?.publicId || null)
      }
    }

    // Listen cả storage event (từ tab khác) và custom event (từ cùng tab)
    window.addEventListener('storage', handleImageUpdate as EventListener)
    window.addEventListener('imageMappingUpdated', handleImageUpdate as EventListener)

    // Check lại mỗi khi editMode thay đổi (để sync với các component khác)
    handleImageUpdate()

    return () => {
      window.removeEventListener('storage', handleImageUpdate as EventListener)
      window.removeEventListener('imageMappingUpdated', handleImageUpdate as EventListener)
    }
  }, [initialSrc, editMode])

  const handleSelectFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (uploading) return
    inputRef.current?.click()
  }

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const result = await uploadToCloudinary(file, initialSrc)
    setUploading(false)

    if (!result) return

    // Tự động build URL từ public_id
    const cloudinaryUrl = `${CLOUDINARY_BASE}/${result.publicId}`
    setSrc(cloudinaryUrl)
    setPublicId(result.publicId)

    // Trigger custom event để các component khác cũng update (kể cả trong cùng tab)
    window.dispatchEvent(
      new CustomEvent('imageMappingUpdated', {
        detail: { originalPath: initialSrc, publicId: result.publicId }
      })
    )
    // Cũng trigger storage event để sync với tab khác
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="editable-image">
      <img src={src} alt={alt} className={className} loading={loading} />
      {editMode && (
        <>
          <button
            type="button"
            className="editable-image__btn"
            onClick={handleSelectFile}
            disabled={uploading}
          >
            {uploading ? 'Đang upload...' : 'Đổi ảnh (Cloudinary)'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleChangeFile}
          />
          {publicId && (
            <div className="editable-image__info">
              {label && <div className="editable-image__label">{label}</div>}
              <div className="editable-image__row">
                <span>URL:</span>
                <input readOnly value={src} onClick={(e) => e.currentTarget.select()} />
              </div>
              <div className="editable-image__row">
                <span>Public ID:</span>
                <input readOnly value={publicId} onClick={(e) => e.currentTarget.select()} />
              </div>
              <div className="editable-image__note">
                ✓ Đã tự động lưu vào localStorage. Trang sẽ tự dùng Cloudinary khi reload.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Danh sách ảnh album (có thể là đường dẫn local hoặc URL Cloudinary)
// Mặc định đang trỏ tới ảnh trong thư mục /public/album
// Bạn có thể thay từng phần tử bằng URL Cloudinary thủ công, ví dụ:
// 'https://res.cloudinary.com/dko2gxv0s/image/upload/v1234567890/wedding/ten_anh.jpg'
const ALBUM_IMAGES = [
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581562/qxxkva89dhfcfjyqbsds.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581577/v23degxpjff7pbrgurhr.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581600/y6rjsy1asiaoikipeofb.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581648/n5wqlyw9hd088umj4s2z.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581654/mbmntoos9btxrfj4geai.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581659/s7fddk4nte6fzscwnxpv.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581667/vq9j0c8vcs8fqhxoyxkz.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581672/iw1ijruvjeyp1qj4fir3.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581680/tpycj8lx4pqb6ivtiwrq.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581687/asywya89m6q3qyuomccg.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581696/kpdrzwpwrenicghxstfm.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581704/mond4qr5azqx8zhj5vk8.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581710/yc5n7tteqkoteb3o94jl.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581718/ahfqwygdhr1qo0c4ezsf.jpg',
  'https://res.cloudinary.com/dko2gxv0s/image/upload/v1772581728/ddxbhwg67o4yc9iktuqz.jpg'
]

const WEDDING_TIME = new Date('2026-04-05T11:00:00+07:00')

function App() {
  const [isBeginOpen, setIsBeginOpen] = useState(true)
  const [isBeginClosing, setIsBeginClosing] = useState(false)
  const [countdown, setCountdown] = useState({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--'
  })
  const [editMode, setEditMode] = useState(false)
  const [isRsvpOpen, setIsRsvpOpen] = useState(false)
  const [isGiftOpen, setIsGiftOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [heroBgUrl, setHeroBgUrl] = useState(() => getImageUrl('/hero.jpg'))
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)
  const heroBgRef = useRef<HTMLDivElement | null>(null)

  // Reload hero background khi localStorage thay đổi
  useEffect(() => {
    const handleImageUpdate = () => {
      setHeroBgUrl(getImageUrl('/hero.jpg'))
    }
    // Listen cả storage event (từ tab khác) và custom event (từ cùng tab)
    window.addEventListener('storage', handleImageUpdate)
    window.addEventListener('imageMappingUpdated', handleImageUpdate)
    // Check lại khi editMode thay đổi
    handleImageUpdate()
    return () => {
      window.removeEventListener('storage', handleImageUpdate)
      window.removeEventListener('imageMappingUpdated', handleImageUpdate)
    }
  }, [editMode])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // ignore autoplay errors
        })
    }
  }

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.fade-in')

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime()
      const diff = WEDDING_TIME.getTime() - now

      if (diff <= 0) {
        setCountdown({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00'
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      })
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!isBeginOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isBeginOpen])

  const closeBegin = () => {
    if (isBeginClosing) return
    setIsBeginClosing(true)
    window.setTimeout(() => {
      setIsBeginOpen(false)
      setIsBeginClosing(false)
    }, 220)
  }

  const handleSubmitRsvp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    // Ở đây bạn có thể gọi API hoặc gửi qua Google Sheets
    console.log('RSVP:', Object.fromEntries(form.entries()))
    alert('Cảm ơn bạn đã xác nhận tham dự!')
    setIsRsvpOpen(false)
    e.currentTarget.reset()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // một số trình duyệt chặn autoplay, khi đó người dùng có thể tự bấm nút nhạc
      })
  }, [])

  return (
    <div className="invite-page">
      <button
        className={`image-edit-toggle ${editMode ? 'is-on' : ''}`}
        type="button"
        onClick={() => setEditMode((v) => !v)}
      >
        {editMode ? 'Tắt chỉnh ảnh' : 'Bật chỉnh ảnh'}
      </button>

      {isBeginOpen && (
        <div
          className={`begin-overlay ${isBeginClosing ? 'is-closing' : ''}`}
          role="button"
          tabIndex={0}
          aria-label="Bấm để mở thiệp"
          onClick={closeBegin}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') closeBegin()
          }}
        >
          <EditableImage
            initialSrc="/begin.gif"
            alt=""
            className="begin-overlay__img"
            editMode={editMode}
            label="Ảnh màn mở thiệp"
          />
          <div className="begin-overlay__content">
            <div className="begin-overlay__names">Thanh Long &amp; Cẩm Thu</div>
            <div className="begin-overlay__date">05.04.2026</div>
          </div>
          <div className="begin-overlay__hint">Chạm để mở thiệp</div>
        </div>
      )}

      <audio src={MUSIC_URL} ref={audioRef} loop />

      {/* Nút nhạc nổi */}
      <button className="music-toggle" type="button" onClick={toggleMusic}>
        {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      </button>

      {/* Start screen */}
      <section className="start-screen fade-in">
        <EditableImage
          initialSrc="/start.gif"
          alt="Thiệp cưới"
          className="start-screen__img"
          editMode={editMode}
          label="Ảnh trang bìa"
        />
        <button
          type="button"
          className="start-screen__cta"
          onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          Xem thiệp
        </button>
      </section>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div
          ref={heroBgRef}
          className="hero__bg"
          style={{ backgroundImage: `url(${heroBgUrl})` }}
        />
        {editMode && (
          <div className="hero__edit-overlay">
            <EditableImage
              initialSrc="/hero.jpg"
              alt="Hero background"
              className="hero__edit-image"
              editMode={editMode}
              label="Ảnh nền Hero"
            />
          </div>
        )}
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__label">THƯ MỜI TIỆC CƯỚI</p>
          <h1 className="hero__names">Thanh Long &amp; Cẩm Thu</h1>
          <p className="hero__datetime">Chủ Nhật - 16:00 • 05.04.2026</p>
        </div>
      </section>

      {/* Nhà trai / nhà gái */}
      <section className="section families">
        <p className="quote">
          “Hôn nhân là chuyện cả đời,
          <br />
          Yêu người vừa ý, cưới người mình thương...”
        </p>

        <div className="families__cards">
          <div className="family-card">
            <p className="family-card__label">NHÀ TRAI</p>
            <p className="family-card__name">Thanh Long</p>
            <p className="family-card__role">Chú Rể</p>
            <p className="family-card__parents">
              ÔNG NGUYỄN THANH HẢI
              <br />
              BÀ TRẦN THỊ UYỂN
            </p>
          </div>

          <div className="family-card">
            <p className="family-card__label">NHÀ GÁI</p>
            <p className="family-card__name">Cẩm Thu</p>
            <p className="family-card__role">Cô Dâu</p>
            <p className="family-card__parents">
              ÔNG NGUYỄN THÀNH QUANG
              <br />
              BÀ NGUYỄN THỊ CẨM VÂN
            </p>
          </div>
        </div>
      </section>

      {/* Giới thiệu Cô dâu Chú rể */}
      <section className="section couple-intro">
        <h2 className="couple-intro__title">Câu chuyện của chúng mình</h2>
        <p className="couple-intro__subtitle">Thanh Long &amp; Cẩm Thu</p>
        <div className="couple-intro__content">
          <figure className="couple-card">
            <div className="couple-card__avatar-wrapper fade-in">
              <EditableImage
                initialSrc="/nam.jpg"
                alt="Chú rể Thanh Long"
                className="couple-card__avatar"
                editMode={editMode}
                loading="lazy"
                label="Ảnh chú rể"
              />
            </div>
            <figcaption className="couple-card__body">
              <p className="couple-card__name">Thanh Long</p>
              <p className="couple-card__label">Chú rể</p>
              <p className="couple-card__text">
                Chàng trai điềm đạm, ấm áp và là người bạn đồng hành vững chãi trong mọi hành
                trình của Thu.
              </p>
            </figcaption>
          </figure>

          <figure className="couple-card">
            <div className="couple-card__avatar-wrapper fade-in delay-1">
              <EditableImage
                initialSrc="/nu.jpg"
                alt="Cô dâu Cẩm Thu"
                className="couple-card__avatar"
                editMode={editMode}
                loading="lazy"
                label="Ảnh cô dâu"
              />
            </div>
            <figcaption className="couple-card__body">
              <p className="couple-card__name">Cẩm Thu</p>
              <p className="couple-card__label">Cô dâu</p>
              <p className="couple-card__text">
                Cô gái luôn mang lại tiếng cười, là nguồn cảm hứng khiến Long muốn trở nên tốt
                hơn mỗi ngày.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Thư mời */}
      <section className="section letter">
        <div className="section-title">
          <span className="section-title__line" />
          <span className="section-title__text">Thư mời</span>
          <span className="section-title__line" />
        </div>
        <p className="letter__subtitle">THAM DỰ LỄ CƯỚI THANH LONG &amp; THU</p>
        <p className="letter__body">
          Trân trọng kính mời Quý khách đến dự bữa tiệc thân mật chung vui cùng gia đình
          chúng tôi trong ngày trọng đại.
        </p>
      </section>

      {/* Thời gian tổ chức */}
      <section className="section time">
        <p className="time__title">TIỆC MỪNG LỄ THÀNH HÔN</p>
        <p className="time__subtitle">Vào lúc 16h00 | Chủ Nhật</p>

        <p className="time__special-date">Tháng 04&nbsp;&nbsp;•&nbsp;&nbsp;05&nbsp;&nbsp;•&nbsp;&nbsp;2026</p>

        <div className="countdown">
          <div className="countdown__item">
            <div className="countdown__number">{countdown.days}</div>
            <div className="countdown__label">Ngày</div>
          </div>
          <div className="countdown__item">
            <div className="countdown__number">{countdown.hours}</div>
            <div className="countdown__label">Giờ</div>
          </div>
          <div className="countdown__item">
            <div className="countdown__number">{countdown.minutes}</div>
            <div className="countdown__label">Phút</div>
          </div>
          <div className="countdown__item">
            <div className="countdown__number">{countdown.seconds}</div>
            <div className="countdown__label">Giây</div>
          </div>
        </div>

        <div className="calendar">
          <div className="calendar__header">
            <span className="calendar__month-script">Tháng 4</span>
            <span className="calendar__year-large">2026</span>
          </div>

          <div className="calendar__grid">
            <div className="calendar__dow">THỨ 2</div>
            <div className="calendar__dow">THỨ 3</div>
            <div className="calendar__dow">THỨ 4</div>
            <div className="calendar__dow">THỨ 5</div>
            <div className="calendar__dow">THỨ 6</div>
            <div className="calendar__dow">THỨ 7</div>
            <div className="calendar__dow">CHỦ NHẬT</div>

            {/* Hàng 1 */}
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day">1</div>
            <div className="calendar__day">2</div>
            <div className="calendar__day">3</div>
            <div className="calendar__day">4</div>
            <div className="calendar__day calendar__day--active">5</div>

            {/* Hàng 2 */}
            <div className="calendar__day">6</div>
            <div className="calendar__day">7</div>
            <div className="calendar__day">8</div>
            <div className="calendar__day">9</div>
            <div className="calendar__day">10</div>
            <div className="calendar__day">11</div>
            <div className="calendar__day">12</div>

            {/* Hàng 3 */}
            <div className="calendar__day">13</div>
            <div className="calendar__day">14</div>
            <div className="calendar__day">15</div>
            <div className="calendar__day">16</div>
            <div className="calendar__day">17</div>
            <div className="calendar__day">18</div>
            <div className="calendar__day">19</div>

            {/* Hàng 4 */}
            <div className="calendar__day">20</div>
            <div className="calendar__day">21</div>
            <div className="calendar__day">22</div>
            <div className="calendar__day">23</div>
            <div className="calendar__day">24</div>
            <div className="calendar__day">25</div>
            <div className="calendar__day">26</div>

            {/* Hàng 5 */}
            <div className="calendar__day">27</div>
            <div className="calendar__day">28</div>
            <div className="calendar__day">29</div>
            <div className="calendar__day">30</div>
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />

            {/* Hàng 6 */}
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
            <div className="calendar__day empty" />
          </div>
        </div>
      </section>

      {/* Địa điểm + Google Maps */}
      <section className="section location" id="location">
        <h2 className="location__title">Địa điểm tổ chức</h2>
        <p className="location__venue">
          Nhà Hàng Tiệc Cưới
          <br />
          <strong>Sunrise Ánh Nhung</strong>
        </p>
        <p className="location__address">
          30 Điện Biên Phủ, Phường Nghĩa Trung, Gia Nghĩa, Đắk Nông
        </p>

        <div className="location__map">
          <iframe
            title="Sunrise Ánh Nhung"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.7014036387445!2d107.6987654!3d11.9982128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3173c709fda2b809%3A0x75dfcaae46689a22!2zTmjDoCBIw6FuZyDDgW5oIE5odW5n!5e1!3m2!1svi!2s!4v1749086946082!5m2!1svi!2s"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <a
          className="btn btn--outline location__btn"
          href="https://maps.app.goo.gl/zs6Sua3TbxHNbW6u7"
          target="_blank"
          rel="noreferrer"
        >
          Xem trên Google Map
        </a>
      </section>

      {/* Highlight */}
      <section className="section highlight">
        <h2 className="highlight__title">Khoảnh khắc đặc biệt</h2>
        <div className="highlight__marquee">
          <div className="highlight__track">
            {['/highlight-1.jpg', '/highlight.jpg', '/highlight-1.jpg', '/highlight.jpg'].map(
              (src, idx) => (
                <figure key={`${src}-${idx}`} className="highlight__item fade-in">
                  <EditableImage
                    initialSrc={src}
                    alt="Khoảnh khắc của Thanh Long &amp; Cẩm Thu"
                    editMode={editMode}
                    loading="lazy"
                    label={`Highlight ${idx + 1}`}
                  />
                </figure>
              )
            )}
          </div>
        </div>
      </section>

      {/* Album hình cưới */}
      <section className="section gallery" id="album">
        <h2 className="gallery__title">Album hình cưới</h2>
        <div className="gallery__grid">
          {ALBUM_IMAGES.map((src, index) => (
            <figure
              key={src}
              className="gallery__item fade-in"
              onClick={() => {
                if (!editMode) {
                  setViewingImage(src)
                }
              }}
              style={{ cursor: editMode ? 'default' : 'pointer' }}
            >
              <EditableImage
                initialSrc={src}
                alt="Album cưới Thanh Long &amp; Cẩm Thu"
                editMode={editMode}
                loading="lazy"
                label={`Ảnh album ${index + 1}`}
              />
            </figure>
          ))}
        </div>
      </section>

      {/* CTA: RSVP & Gửi mừng */}
      <section className="section cta" id="rsvp">
        <h2 className="cta__title">Rất hân hạnh được đón tiếp!</h2>
        <div className="cta__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setIsGiftOpen(false)
              setIsRsvpOpen(true)
            }}
          >
            Xác nhận tham dự
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setIsRsvpOpen(false)
              setIsGiftOpen(true)
            }}
          >
            Gửi mừng cưới
          </button>
        </div>
      </section>

      <footer className="footer">
        <p>Thiệp cưới online Thanh Long &amp; Cẩm Thu</p>
      </footer>

      {/* Popup RSVP */}
      {isRsvpOpen && (
        <div className="modal-backdrop" onClick={() => setIsRsvpOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal__close"
              onClick={() => setIsRsvpOpen(false)}
            >
              ×
            </button>
            <h3 className="modal__title">Xác nhận tham dự</h3>
            <form className="modal__form" onSubmit={handleSubmitRsvp}>
              <label className="field">
                <span>Tên của bạn là?</span>
                <input name="full_name" required placeholder="Ví dụ: Nguyễn Văn A" />
              </label>
              <label className="field">
                <span>Bạn là gì của Dâu Rể?</span>
                <input
                  name="relationship"
                  placeholder="Bạn học, đồng nghiệp, người thân..."
                />
              </label>
              <label className="field">
                <span>Lời chúc đến Dâu Rể</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Gửi vài lời chúc dễ thương nhé!"
                />
              </label>
              <label className="field">
                <span>Bạn có tham dự không?</span>
                <select name="status" defaultValue="">
                  <option value="" disabled>
                    Chọn giúp tụi mình
                  </option>
                  <option value="yes">Có thể tham dự</option>
                  <option value="no">Không thể tham dự</option>
                </select>
              </label>

              <button type="submit" className="btn btn--primary modal__submit">
                Gửi ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup Gửi mừng cưới */}
      {isGiftOpen && (
        <div className="modal-backdrop" onClick={() => setIsGiftOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal__close"
              onClick={() => setIsGiftOpen(false)}
            >
              ×
            </button>
            <h3 className="modal__title">Gửi mừng cưới</h3>
            <p className="modal__body">
              Bạn có thể thêm thông tin số tài khoản, QR code, hoặc hướng dẫn gửi mừng cưới
              tại đây.
            </p>
          </div>
        </div>
      )}

      {/* Modal xem ảnh full size */}
      {viewingImage && (
        <div
          className="image-viewer-backdrop"
          onClick={() => setViewingImage(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setViewingImage(null)
          }}
        >
          <button
            type="button"
            className="image-viewer__close"
            onClick={() => setViewingImage(null)}
            aria-label="Đóng"
          >
            ×
          </button>
          <div className="image-viewer__container" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewingImage}
              alt="Album cưới Thanh Long &amp; Cẩm Thu"
              className="image-viewer__img"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
