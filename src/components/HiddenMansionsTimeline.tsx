import "./HiddenMansionsTimeline.css";

type TimelineType = "gate" | "rings" | "toast" | "photo";

type EventItem = {
  time: string;
  title: string;
  type: TimelineType;
};

type TimelineItemProps = {
  time: string;
  title: string;
  type: TimelineType;
  isLast: boolean;
};

const TIMELINE_ICONS: Record<TimelineType, string> = {
  gate: "https://res.cloudinary.com/dko2gxv0s/image/upload/v1773629254/1_c0l94u.png",
  rings: "https://res.cloudinary.com/dko2gxv0s/image/upload/v1773629271/2_fvdria.png",
  toast: "https://res.cloudinary.com/dko2gxv0s/image/upload/v1773629308/3_uewmla.png",
  photo: "https://res.cloudinary.com/dko2gxv0s/image/upload/v1773629301/4_tmdf7m.png",
};

const BG_IMAGE =
  "https://res.cloudinary.com/dko2gxv0s/image/upload/v1773629365/8adbb936-650f-40c8-b850-871ceb307468_pv3krn.webp";

const events: EventItem[] = [
  { time: "17 : 00", title: "Đón khách", type: "gate" },
  { time: "18 : 30", title: "Lễ Thành Hôn", type: "rings" },
  { time: "19 : 00", title: "Khai tiệc", type: "toast" },
  { time: "20 : 00", title: "Dance", type: "photo" },
];

function TimelineItem({ time, title, type, isLast }: TimelineItemProps) {
  return (
    <div className="hm-timeline-item">
      <div className="hm-timeline-icon-wrap">
        <img
          src={TIMELINE_ICONS[type]}
          alt={title}
          className="hm-timeline-icon"
          loading="lazy"
        />
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
      <div
        className="hm-card"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
        }}
      >
        <div className="hm-overlay" />

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