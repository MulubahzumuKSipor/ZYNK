import Image from "next/image"
import styles from "@/app/ui/styles/footer.module.css"
export default function Footer(){
    return(
        // Assuming you import styles from './footer.module.css'
        <div className="main_wrapper_footer">
            <footer className={styles.footerGlass}>
                <p className={styles.copyright}>
                    &copy; 2025 | Mulubahzumu Kemmeh Sipor | <a href="mailto:msipor@byupathway.edu">msipor@byupathway.edu</a>
                </p>
                <div className={styles.footerLinks}>
                    <a href="https://app.daily.dev/mulubahzumukemmehsipor" target="_blank"
                    ><Image width={60} height={60} src="/dailydev.svg" alt="Daily Developer"
                    /></a>
                    <a href="https://wwwLinedin.com/in/mulubahzumu-kemmeh-sipor-526a74197/" target="_blank"
                    ><Image width={60} height={60} src="/linkedin.svg" alt="LinkedIn"
                    /></a>
                    <a href="https://github.com/MulubahzumuKSipor" target="_blank"
                    ><Image width={60} height={60} src="/github.svg" alt="Github"
                    /></a>
                </div>
            </footer>
        </div>
    )
}