import { Heart, ArrowUpLeft, LoaderCircle, X } from "lucide-react";
import { Link } from "wouter";
import { useEffect,useRef,type ReactNode } from "react";
export function Brand({
  name = "عروستنا",
  light = false,
}: {
  name?: string;
  light?: boolean;
}) {
  return (
    <Link href="/" className={`brand ${light ? "light" : ""}`}>
      <Heart size={20} strokeWidth={1} />
      <span>{name}</span>
      <small>ARO O SETNA</small>
    </Link>
  );
}
export function Button({
  children,
  busy = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={`btn ${props.className ?? ""}`}
    >
      {busy ? <LoaderCircle size={17} className="spin" /> : null}
      {children}
    </button>
  );
}
export function Loading() {
  return (
    <div className="loading">
      <LoaderCircle className="spin" />
      <span>لحظة واحدة، بنجهّز مساحتك…</span>
    </div>
  );
}
export function ErrorBox({ error }: { error: unknown }) {
  return error ? (
    <div role="alert" className="error">
      {error instanceof Error ? error.message : String(error)}
    </div>
  ) : null;
}
export function PageTitle({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();},[]);
  return (
      <dialog
        ref={ref}
        className="modal"
        aria-modal="true"
        aria-label={title}
        onCancel={onClose}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="إغلاق" onClick={onClose}>
            <X />
          </button>
        </div>
        {children}
      </dialog>
  );
}
export function Empty({
  text = "لسه مفيش بيانات. أضيفي أول بند وابدئي رحلتك.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <Heart size={26} strokeWidth={1} />
      <p>{text}</p>
    </div>
  );
}
export function Arrow() {
  return <ArrowUpLeft size={17} />;
}
