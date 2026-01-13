
import Image, { StaticImageData } from "next/image"
import styles from "@/app/ui/styles/footer.module.css"

// ----------------------------------------------------
// 1. TYPESCRIPT INTERFACES
// ----------------------------------------------------

interface LinkItem {
  text: string
  href: string
}

interface SocialIconProps {
  href: string
  src: string | StaticImageData
  alt: string
}

interface FooterColumnProps {
  title: string
  links: LinkItem[]
}

// ----------------------------------------------------
// 2. HELPER COMPONENTS
// ----------------------------------------------------

const SocialIcon = ({ href, src, alt }: SocialIconProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.socialIcon}
  >
    <Image width={24} height={24} src={src} alt={alt} />
  </a>
)

const FooterColumn = ({ title, links }: FooterColumnProps) => (
  <div className={styles.footerColumn}>
    <h4 className={styles.columnTitle}>{title}</h4>
    <ul className={styles.columnList}>
      {links.map(link => (
        <li key={link.text}>
          <a href={link.href} className={styles.footerLink}>
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  </div>
)

// ----------------------------------------------------
// 3. MAIN FOOTER COMPONENT
// ----------------------------------------------------

export default function DashFooter() {

  return (
    <div className="main_wrapper_footer">
      <footer className={styles.ecommerceFooter}>
          {/* Copyright */}
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} ZYNK SALES. All rights reserved.
            <span className={styles.designerCredit}>
              {" "} | Designed by{" "}
              <a href="mailto:msipor@byupathway.edu">Mulubahzumu K. Sipor</a>
            </span>
          </p>
      </footer>
    </div>
  )
}
