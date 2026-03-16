import { Camera, PartyPopper, Wine } from "lucide-react";
import "./HiddenMansionsTimeline.css";

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
  { time: "17 : 00", title: "Đón khách", type: "gate" },
  { time: "18 : 30", title: "Lễ Thành Hôn", type: "rings" },
  { time: "19 : 00", title: "Khai tiệc", type: "toast" },
  { time: "20 : 00", title: "Dance", type: "photo" },
];

function FloralTopLeft() {
  return (
    <svg
      viewBox="0 0 220 220"
      className="hm-floral hm-floral--top-left"
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
      className="hm-floral hm-floral--bottom-right"
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
    <svg viewBox="0 0 64 64" className="hm-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg viewBox="0 0 64 64" className="hm-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  const commonClass = "hm-icon-lucide";

  if (type === "gate") return <ArchSvg />;
  if (type === "rings") return <RingsSvg />;
  if (type === "toast") return <Wine className={commonClass} strokeWidth={1.8} />;

  return (
    <div className="hm-photo-icon">
      <Camera className={commonClass} strokeWidth={1.8} />
      <PartyPopper className="hm-party-icon" strokeWidth={1.8} />
    </div>
  );
}

function TimelineItem({ time, title, type, isLast }: TimelineItemProps) {
  return (
    <div className="hm-timeline-item">
      <div className="hm-timeline-icon-wrap">
        <TimelineIcon type={type} />
      </div>

      <div className="hm-timeline-line-wrap">
        <div className={`hm-timeline-line ${isLast ? "hm-timeline-line--last" : ""}`} />
        <div className="hm-timeline-line-horizontal" />
      </div>

      <div className="hm-timeline-content">
        <div className="hm-timeline-time">{time}</div>
        <div className="hm-timeline-title">{title}</div>
      </div>
    </div>
  );
}

export default function HiddenMansionsTimeline() {
  return (
    <div className="hm-wrapper">
      <div className="hm-card">
        <div className="hm-bg-layer">
          <FloralTopLeft />
          <FloralBottomRight />

          <svg
            viewBox="0 0 400 860"
            className="hm-dots"
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

        <div className="hm-content">
          <div className="hm-header">
            <p className="hm-venue">Tại : Hidden Mansions Saigon Resort</p>
            <p className="hm-address">
              112 Đ. Võ Thị Liễu, An Phú Đông, Quận 12,
              <br />
              Thành phố Hồ Chí Minh
            </p>
          </div>

          <h2 className="hm-heading">Timeline</h2>

          <div className="hm-timeline">
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

          <div className="hm-footer-text">
            <p>
              Sự hiện diện của Quý vị
              <br />
              là niềm vinh hạnh của Gia đình chúng tôi!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}