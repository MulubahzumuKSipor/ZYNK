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

export default function Footer() {
  const companyLinks: LinkItem[] = [
    { text: "About Us", href: "/about" },
    { text: "Careers", href: "/careers" },
    { text: "Our Blog", href: "/blog" },
    { text: "Affiliate Program", href: "/affiliate" },
  ]

  const supportLinks: LinkItem[] = [
    { text: "Contact Us", href: "/contact" },
    { text: "FAQ", href: "/faq" },
    { text: "Shipping & Returns", href: "/shipping" },
    { text: "Track Order", href: "/track-order" },
  ]

  const legalLinks: LinkItem[] = [
    { text: "Privacy Policy", href: "/policy/privacy" },
    { text: "Terms of Service", href: "/policy/terms" },
    { text: "Accessibility", href: "/policy/accessibility" },
    { text: "Cookie Settings", href: "/policy/cookies" },
  ]

  return (
    <div className="main_wrapper_footer">
      <footer className={styles.ecommerceFooter}>
        {/* Main Footer Content */}
        <div className={styles.footerContent}>
          {/* Brand Info */}
          <div className={styles.brandInfo}>
            <h3 className={styles.brandName}>ZYNK SALES</h3>
            <p className={styles.tagline}>
              Quality products, delivered with care.
            </p>
          </div>

          {/* Footer Columns */}
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Help & Support" links={supportLinks} />
          <FooterColumn title="Policies" links={legalLinks} />
        </div>

        <hr className={styles.footerDivider} />

        {/* Bottom Section */}
        <div className={styles.footerBottom}>
          {/* Social Media */}
          <div className={styles.socialMedia}>
            <SocialIcon href="https://www.facebook.com/" src="/facebook.svg" alt="Facebook" />
            <SocialIcon href="https://www.instagram.com/" src="/instagram.svg" alt="Instagram" />
            <SocialIcon href="https://www.pinterest.com/" src="/pinterest.svg" alt="Pinterest" />
            <SocialIcon href="https://twitter.com/" src="/twitter.svg" alt="Twitter" />
          </div>

          {/* Payment Methods */}
          <div className={styles.paymentMethods}>
            <Image width={35} height={20} src="/visa.svg" alt="Visa" />
            <Image width={35} height={20} src="/mastercard.svg" alt="Mastercard" />
            <Image width={35} height={20} src="/paypal.svg" alt="PayPal" />
            <Image width={35} height={20} src="/amex.svg" alt="American Express" />
            <Image width={35} height={20} src="/applepay.svg" alt="Apple Pay" />
          </div>

          {/* Copyright */}
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} ZYNK SALES. All rights reserved.
            <span className={styles.designerCredit}>
              {" "} | Designed by{" "}
              <a href="mailto:msipor@byupathway.edu">Mulubahzumu K. Sipor</a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}
