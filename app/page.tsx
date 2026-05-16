import Link from "next/link";
import { ArrowRight, Hammer, LayoutGrid, Lock, UserCheck } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main
      className={styles.page}
      style={{ backgroundImage: "url('/robert-keane-irzV4osXXkA-unsplash.jpg')" }}
    >
      <div className={styles.overlay} aria-hidden />

      <div className={styles.shell}>
        <div className={styles.brandBlock}>
          <div className={styles.brandRow}>
            <div className={styles.logoBox}>
              <Hammer size={32} strokeWidth={2.25} />
            </div>
            <h1 className={styles.title}>
              <span className={styles.titleAccent}>Sledge</span>{" "}
              <span className={styles.titleMain}>Concrete</span>
            </h1>
          </div>
          <p className={styles.eyebrow}>Field Management System</p>
        </div>

        <div className={styles.rule} />

        <div className={styles.access}>
          <p className={styles.accessLabel}>Select your access level</p>

          <div className={styles.cards}>
            <Link
              href="/dashboard?tablet=1"
              className={`${styles.card} ${styles.cardPrimary}`}
            >
              <div className={styles.iconBox}>
                <LayoutGrid size={24} strokeWidth={2.25} />
              </div>
              <div className={styles.cardCopy}>
                <h2>Hub Sign-In</h2>
                <p>
                  Shared tablet at the office or job site. Everyone can view files, jobs, and safety.
                </p>
              </div>
              <span className={styles.cardAction}>
                Enter Hub <ArrowRight size={16} strokeWidth={2.25} />
              </span>
            </Link>

            <Link
              href="/dashboard"
              className={styles.card}
            >
              <div className={styles.iconBox}>
                <UserCheck size={24} strokeWidth={2.25} />
              </div>
              <div className={styles.cardCopy}>
                <h2>Crew Sign-In</h2>
                <p>
                  Personal login on your device. Time clock, your jobs, photos, and safety forms.
                </p>
              </div>
              <span className={styles.cardAction}>
                Sign In <ArrowRight size={16} strokeWidth={2.25} />
              </span>
            </Link>
          </div>
        </div>

        <p className={styles.footerNote}>
          <Lock size={12} strokeWidth={2.25} />
          Internal use only — Sledge Concrete Ltd.
        </p>
      </div>
    </main>
  );
}
