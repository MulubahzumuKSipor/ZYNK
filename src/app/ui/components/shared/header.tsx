"use client";
import Nav from "@/app/ui/nav"
import Image from "next/image"
import styles from "@/app/ui/styles/header.module.css"
import Link from "next/link";
import ProductSearch from "../product_search";


export default function Header() {
    return(
        <div className="main_wrapper">
                <Link href={"/"} className="link">
                <div className={styles.logo}>
                    <Image src="/logo.webp" alt="NatFruit Ecommerce Logo" width={60} height={60} className="image"/>
                    <h1 className={styles.title}>ZYNK</h1>
                </div>
                </Link>
                <ProductSearch limit={10} />
                <div className={styles.nav_cart_wrapper}>
                    <Nav />
                </div>
        </div>
    )
}

