import { Camera, Menu, PartyPopper, Wine } from "lucide-react";

type TimelineType = "gate" | "rings" | "toast" | "photo";

type EventItem = {
  time: string;
  title: string;
  type: TimelineType;
};

type TimelineIconProps = {
  type: TimelineType;
};

type TimelineItemProps = {
  time: string;
  title: string;
  type: TimelineType;
  isLast: boolean;
};

const events: EventItem[] = [
  {
    time: "17 : 00",
    title: "Đón khách",
    type: "gate",
  },
  {
    time: "18 : 30",
    title: "Lễ Thành Hôn",
    type: "rings",
  },
  {
    time: "19 : 00",
    title: "Khai tiệc",
    type: "toast",
  },
  {
    time: "20 : 00",
    title: "Dance",
    type: "photo",
  },
];

function FloralTopLeft() {
  return (
    <svg
      viewBox="0 0 220 220"
      className="absolute left-0 top-0 h-40 w-40 opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#d8c6c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 56C48 24 95 18 118 49C96 46 70 61 59 84" />
        <path d="M59 84C44 112 46 148 68 175" />
        <path d="M84 26C112 34 128 62 125 90" />
        <path d="M97 56C110 43 128 36 149 38" />
        <path d="M38 103C63 99 86 110 101 131" />
        <path d="M18 134C45 123 77 128 101 148" />
        <path d="M116 92C132 76 154 69 177 74" />
        <path d="M120 111C143 102 168 103 190 117" />
        <path d="M92 150C114 145 138 151 157 168" />
        <path d="M32 54C46 58 56 69 59 84" />
        <path d="M61 39C75 48 83 61 84 77" />
        <path d="M117 49C129 56 137 69 139 84" />
        <path d="M149 39C156 49 160 59 160 73" />
      </g>
    </svg>
  );
}

function FloralBottomRight() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="absolute bottom-0 right-0 h-44 w-44 opacity-60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="#d8c6c3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M214 182C191 153 150 137 115 149" />
        <path d="M115 149C82 160 58 189 47 220" />
        <path d="M190 132C163 123 135 128 112 147" />
        <path d="M156 105C136 111 119 126 112 147" />
        <path d="M211 102C184 95 155 103 136 123" />
        <path d="M201 68C180 70 163 81 153 98" />
        <path d="M134 155C144 181 164 203 190 215" />
        <path d="M98 170C100 192 93 212 76 228" />
        <path d="M170 145C170 120 183 99 205 87" />
      </g>
    </svg>
  );
}

function ArchSvg() {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 56H52" />
        <path d="M18 56V24C18 14.059 26.059 6 36 6C45.941 6 54 14.059 54 24V56" />
        <path d="M10 56H18" />
        <path d="M46 56H54" />
        <path d="M26 56V28C26 22.477 30.477 18 36 18C41.523 18 46 22.477 46 28V56" />
        <path d="M31 25C31 22.791 32.791 21 35 21C37.209 21 39 22.791 39 25C39 28.5 35 31.5 35 31.5C35 31.5 31 28.5 31 25Z" />
      </g>
    </svg>
  );
}

function RingsSvg() {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="38" r="12" />
        <circle cx="40" cy="38" r="12" />
        <path d="M35 16L39 8L43 16" />
        <path d="M39 8V22" />
        <path d="M33 22H45" />
        <path d="M34 16H44" />
      </g>
    </svg>
  );
}

function TimelineIcon({ type }: TimelineIconProps) {
  const commonClass = "h-10 w-10 text-[#a36a12]";

  if (type === "gate") {
    return <ArchSvg />;
  }

  if (type === "rings") {
    return <RingsSvg />;
  }

  if (type === "toast") {
    return <Wine className={commonClass} strokeWidth={1.8} />;
  }

  return (
    <div className="relative flex items-center justify-center">
      <Camera className={commonClass} strokeWidth={1.8} />
      <PartyPopper
        className="absolute -right-3 -top-2 h-4 w-4 text-[#a36a12]"
        strokeWidth={1.8}
      />
    </div>
  );
}

function TimelineItem({ time, title, type, isLast }: TimelineItemProps) {
  return (
    <div className="grid grid-cols-[72px_20px_1fr] items-center gap-3 min-h-[92px]">
      <div className="flex items-center justify-center text-[#a36a12]">
        <TimelineIcon type={type} />
      </div>

      <div className="relative flex h-full justify-center">
        <div className={`w-px bg-[#b17418] ${isLast ? "h-[72px]" : "h-full"}`} />
        <div className="absolute top-1/2 h-px w-4 -translate-y-1/2 bg-[#b17418]" />
      </div>

      <div className="py-4">
        <div className="text-[28px] font-semibold tracking-[0.08em] text-[#a36a12] leading-none sm:text-[30px]">
          {time}
        </div>
        <div className="mt-2 text-[16px] font-medium text-[#6e6a6c] sm:text-[17px]">
          {title}
        </div>
      </div>
    </div>
  );
}

export default function HiddenMansionsInvitation() {
  return (
    <div className="min-h-screen bg-[#f7f1ef] px-3 py-2 text-[#2f2f2f]">
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-[#efe5e1] bg-[#f8f3f1] shadow-[0_10px_30px_rgba(80,40,20,0.08)]">
        <div className="pointer-events-none absolute inset-0">
          <FloralTopLeft />
          <FloralBottomRight />

          <svg
            viewBox="0 0 400 860"
            className="absolute inset-0 h-full w-full opacity-30"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern id="paperDots" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                <circle cx="9" cy="10" r="1.2" fill="#e8d7d4" />
                <circle cx="30" cy="14" r="1" fill="#eadcda" />
                <circle cx="18" cy="34" r="1.1" fill="#ead8d5" />
                <circle cx="40" cy="39" r="1.2" fill="#ead8d5" />
              </pattern>
            </defs>
            <rect width="400" height="860" fill="url(#paperDots)" />
          </svg>
        </div>

        <div className="relative px-6 pb-10 pt-8 sm:px-7">
          <div className="text-center">
            <p className="text-[18px] font-semibold leading-snug text-[#2f2f2f] sm:text-[20px]">
              Tại : Hidden Mansions Saigon Resort
            </p>
            <p className="mx-auto mt-2 max-w-[290px] text-[16px] leading-8 text-[#454042] sm:text-[17px]">
              112 Đ. Võ Thị Liễu, An Phú Đông, Quận 12,
              <br />
              Thành phố Hồ Chí Minh
            </p>
          </div>

          <h2 className="mt-8 text-center text-[24px] font-bold uppercase tracking-[0.08em] text-[#a36a12] sm:text-[26px]">
            Timeline
          </h2>

          <div className="mx-auto mt-5 w-full max-w-[320px]">
            {events.map((event, index) => (
              <TimelineItem
                key={event.time}
                time={event.time}
                title={event.title}
                type={event.type}
                isLast={index === events.length - 1}
              />
            ))}
          </div>

          <div className="mt-14 px-3 text-center">
            <p className="font-serif text-[24px] italic leading-[1.55] text-[#5b4d56] sm:text-[26px]">
              Sự hiện diện của Quý vị
              <br />
              là niềm vinh hạnh của Gia đình chúng tôi!
            </p>
          </div>
        </div>

        <button
          className="absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#a67b96] text-white shadow-[0_8px_20px_rgba(125,87,115,0.35)] transition active:scale-95"
          aria-label="Mở menu"
          type="button"
        >
          <Menu className="h-7 w-7" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}