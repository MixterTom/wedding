import { useEffect, useRef, useState } from 'react'
import './App.css'

const MUSIC_URL =
  'https://statics.pancake.vn/web-media/30/2d/16/de/6ef7c8fcf6b86241ef11f111d6d3269a74a27c5ab5a451854d150895-w:0-h:0-l:2426583-t:audio/mpeg.mp3'

// Cloudinary config (chỉ dùng public URL, không để lộ api_key / secret ở frontend)
const CLOUDINARY_BASE =
  'https://res.cloudinary.com/wedding/image/upload/f_auto,q_auto'

// Đổi biến này sang true sau khi bạn upload ảnh lên Cloudinary với đúng publicId
const USE_CLOUDINARY = false

const ALBUM_IMAGE_IDS = [
  'TL_01',
  'TL_02',
  'TL_03',
  'TL_04',
  'TL_05',
  'TL_06',
  'TL_07',
  'TL_08',
  'TL_09',
  'TL_10',
  'TL_11',
  'TL_12',
  'TL_13',
  'TL_14',
  'TL_15'
]

const ALBUM_IMAGES = ALBUM_IMAGE_IDS.map((id) =>
  USE_CLOUDINARY ? `${CLOUDINARY_BASE}/${id}` : `/album/${id}.jpg`
)

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
  const [isRsvpOpen, setIsRsvpOpen] = useState(false)
  const [isGiftOpen, setIsGiftOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)

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
          <img className="begin-overlay__img" src="/begin.gif" alt="" />
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
        <img className="start-screen__img" src="/start.gif" alt="Thiệp cưới" />
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
        <div className="hero__bg" />
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
              <img
                className="couple-card__avatar"
                src="/nam.jpg"
                alt="Chú rể Thanh Long"
                loading="lazy"
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
              <img
                className="couple-card__avatar"
                src="/nu.jpg"
                alt="Cô dâu Cẩm Thu"
                loading="lazy"
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
                  <img src={src} alt="Khoảnh khắc của Thanh Long &amp; Cẩm Thu" loading="lazy" />
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
          {ALBUM_IMAGES.map((src) => (
            <figure key={src} className="gallery__item fade-in">
              <img src={src} alt="Album cưới Thanh Long &amp; Cẩm Thu" loading="lazy" />
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
    </div>
  )
}

export default App
