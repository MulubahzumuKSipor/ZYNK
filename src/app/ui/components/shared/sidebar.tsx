'use client';

import { usePathname } from 'next/navigation';
import { useDashboardTheme } from '@/app/ui/components/shared/themeProvider'; // adjust path if needed
import Link from 'next/link';
import styles from '../../styles/sidebar.module.css';

// Placeholder icons (replace with your own or lucide-react)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L2 12h3v8h14v-8h3M9 18H7v-6h2m4 6h-2v-8h2m4 8h-2v-4h2"/></svg>
);

// const DashboardIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <rect x="3" y="3" width="7" height="9"/>
//     <rect x="14" y="3" width="7" height="5"/>
//     <rect x="14" y="12" width="7" height="9"/>
//     <rect x="3" y="16" width="7" height="5"/>
//   </svg>
// );

const ProductIcon = () => <svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"><path d="M9.5 21.5h-9v-14h12v4"/><path d="M23.5 13.5h-12v8h12zm-2-7h-7v7h7zm-18 4v-7h6v7"/><path d="M16.5 8.5v-4h3v4m-8 9h12m-6 4v-8"/></g></svg>
const OrdersIcon = () => <svg fill='currentColor' xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 31.68V16.319m-3.936 12.479c.775.98 1.746 1.346 3.098 1.346h1.87c1.741 0 3.152-1.375 3.152-3.072h0c0-1.697-1.41-3.072-3.152-3.072h-2.066c-1.74 0-3.152-1.375-3.152-3.072h0c0-1.697 1.41-3.072 3.152-3.072h1.87c1.353 0 2.324.365 3.099 1.346m-3.874 14.96v7.592m19.44-30.21v19.27L24.965 41.517a1.81 1.81 0 0 1-1.81 0L4.5 30.745V11.474m26.448 7.318L43.5 11.545l-9.12-5.266h0l-6.426 3.71c-2.183 1.26-5.732 1.254-7.929-.014L13.56 6.242L4.5 11.474l12.552 7.247" stroke-width="2"/></svg>
const CustomersIcon = () => <svg width="30px" height="30px" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor" id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M2,21h8a1,1,0,0,0,0-2H3.071A7.011,7.011,0,0,1,10,13a5.044,5.044,0,1,0-3.377-1.337A9.01,9.01,0,0,0,1,20,1,1,0,0,0,2,21ZM10,5A3,3,0,1,1,7,8,3,3,0,0,1,10,5Zm13,8.5v5a.5.5,0,0,1-.5.5h-1v2L19,19H14.5a.5.5,0,0,1-.5-.5v-5a.5.5,0,0,1,.5-.5h8A.5.5,0,0,1,23,13.5Z"></path></g></svg>;
const AnalyticsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 32 32"><path fill="currentColor" d="M4 2H2v26a2 2 0 0 0 2 2h26v-2H4Z"/><path fill="currentColor" d="M30 9h-7v2h3.59L19 18.59l-4.29-4.3a1 1 0 0 0-1.42 0L6 21.59L7.41 23L14 16.41l4.29 4.3a1 1 0 0 0 1.42 0l8.29-8.3V16h2Z"/></svg>;
const MarketingIcon = () => <svg height="30px" width="30px" version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" enable-background="new 0 0 24 24" fill="currentColor" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M23.4,13.3C23,13.1,22.4,13,22,13.2l-1,0.4v-12C21,0.7,20.3,0,19.5,0h-2C16.7,0,16,0.7,16,1.5V3h-2.5C12.7,3,12,3.7,12,4.5 V8H9.5C8.7,8,8,8.7,8,9.5v5.2l-3,0.7v-0.3c0-0.6-0.3-1.1-0.8-1.3L3,13.2C2.8,12.5,2.2,12,1.5,12h-1C0.2,12,0,12.2,0,12.5v11 C0,23.8,0.2,24,0.5,24h1c0.7,0,1.3-0.5,1.5-1.2l1.2-0.6C4.6,22,4.9,21.5,5,21l4.8,2.8c0.2,0.1,0.5,0.2,0.8,0.2 c0.2,0,0.5-0.1,0.7-0.2l12-6.4c0.5-0.3,0.8-0.8,0.8-1.3v-1.5C24,14.1,23.8,13.6,23.4,13.3z M2,22.5C2,22.8,1.8,23,1.5,23H1V13h0.5 C1.8,13,2,13.2,2,13.5V22.5z M4,20.9c0,0.2-0.1,0.4-0.3,0.4L3,21.7v-7.4l0.7,0.4C3.9,14.8,4,14.9,4,15.1V20.9z M17,1.5 C17,1.2,17.2,1,17.5,1h2C19.8,1,20,1.2,20,1.5v12.4L17,15V1.5z M13,4.5C13,4.2,13.2,4,13.5,4H16v11.4l-1.4,0.5l-0.3-1.1 c-0.2-0.6-0.7-1-1.2-1.1V4.5z M9,9.5C9,9.2,9.2,9,9.5,9H12v4.8l-3,0.7V9.5z M23,16c0,0.2-0.1,0.4-0.3,0.4l-12,6.5 c-0.1,0.1-0.3,0.1-0.5,0L5,19.9v-3.5l7.7-1.7c0.3-0.1,0.5,0.1,0.6,0.4l0.5,1.6c0,0.1,0,0.3,0,0.4c-0.1,0.1-0.2,0.2-0.3,0.2l-3,0.7 c-0.3,0.1-0.4,0.3-0.4,0.6c0.1,0.2,0.3,0.4,0.5,0.4c0,0,0.1,0,0.1,0l3-0.7c0.4-0.1,0.7-0.4,0.9-0.7c0.1-0.2,0.2-0.4,0.2-0.6l7.6-2.8 c0.2-0.1,0.3,0,0.5,0.1c0.1,0.1,0.2,0.2,0.2,0.4V16z"></path> </g></svg>;
const PaymentsIcon = () => <svg fill="currentColor" width="30px" height="30px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g data-name="21 payment" id="_21_payment"> <path d="M29.38,9.97H9.81a2.006,2.006,0,0,0-2,2v4.47a2.006,2.006,0,0,0,2,2H29.38a2,2,0,0,0,2-2V11.97A2,2,0,0,0,29.38,9.97Zm0,6.47H9.81V11.97H29.38Z"></path> <path d="M10.97,21.83a3.16,3.16,0,1,0,3.16,3.16A3.167,3.167,0,0,0,10.97,21.83Zm0,4.32a1.16,1.16,0,1,1,1.16-1.16A1.161,1.161,0,0,1,10.97,26.15Z"></path> <path d="M19.6,21.83a3.16,3.16,0,1,0,3.15,3.16A3.167,3.167,0,0,0,19.6,21.83Zm0,4.32a1.16,1.16,0,1,1,1.15-1.16A1.161,1.161,0,0,1,19.6,26.15Z"></path> <path d="M28.23,21.83a3.16,3.16,0,1,0,3.15,3.16A3.16,3.16,0,0,0,28.23,21.83Zm0,4.32a1.16,1.16,0,1,1,1.15-1.16A1.161,1.161,0,0,1,28.23,26.15Z"></path> <path d="M10.97,30.46a3.155,3.155,0,1,0,3.16,3.16A3.167,3.167,0,0,0,10.97,30.46Zm0,4.31a1.155,1.155,0,1,1,1.16-1.15A1.159,1.159,0,0,1,10.97,34.77Z"></path> <path d="M19.6,30.46a3.155,3.155,0,1,0,3.15,3.16A3.167,3.167,0,0,0,19.6,30.46Zm0,4.31a1.155,1.155,0,1,1,1.15-1.15A1.159,1.159,0,0,1,19.6,34.77Z"></path> <path d="M28.23,30.46a3.155,3.155,0,1,0,3.15,3.16A3.16,3.16,0,0,0,28.23,30.46Zm0,4.31a1.155,1.155,0,1,1,1.15-1.15A1.159,1.159,0,0,1,28.23,34.77Z"></path> <path d="M10.97,39.09a3.155,3.155,0,1,0,3.16,3.16A3.16,3.16,0,0,0,10.97,39.09Zm0,4.31a1.155,1.155,0,1,1,1.16-1.15A1.159,1.159,0,0,1,10.97,43.4Z"></path> <path d="M19.6,39.09a3.155,3.155,0,1,0,3.15,3.16A3.16,3.16,0,0,0,19.6,39.09Zm0,4.31a1.155,1.155,0,1,1,1.15-1.15A1.159,1.159,0,0,1,19.6,43.4Z"></path> <path d="M10.97,47.72a3.155,3.155,0,1,0,3.16,3.15A3.158,3.158,0,0,0,10.97,47.72Zm0,4.31a1.155,1.155,0,1,1,1.16-1.16A1.161,1.161,0,0,1,10.97,52.03Z"></path> <path d="M19.6,47.72a3.155,3.155,0,1,0,3.15,3.15A3.158,3.158,0,0,0,19.6,47.72Zm0,4.31a1.155,1.155,0,1,1,0-2.31,1.155,1.155,0,0,1,0,2.31Z"></path> <path d="M29.38,39.09H27.07a2.006,2.006,0,0,0-2,2V52.03a2.006,2.006,0,0,0,2,2h2.31a2,2,0,0,0,2-2V41.09A2,2,0,0,0,29.38,39.09Zm0,12.94H27.07V41.09h2.31Z"></path> <path d="M56.26,11.05H35.7V9.58a5.008,5.008,0,0,0-5-5H8.5a5,5,0,0,0-5,5V54.42a5,5,0,0,0,5,5H30.7a5.008,5.008,0,0,0,5-5V52.95H56.26a4.24,4.24,0,0,0,4.24-4.23V15.28A4.24,4.24,0,0,0,56.26,11.05ZM33.7,54.42a3,3,0,0,1-3,3H8.5a3,3,0,0,1-3-3V9.58a3,3,0,0,1,3-3H30.7a3,3,0,0,1,3,3Zm6.47-3.47H35.7V13.05h4.47ZM58.5,48.72a2.234,2.234,0,0,1-2.24,2.23H42.17V13.05H56.26a2.234,2.234,0,0,1,2.24,2.23Z"></path> <path d="M56.19,36.31a5.855,5.855,0,0,0-11.71,0,5.768,5.768,0,0,0,1,3.24,5.737,5.737,0,0,0-1,3.23,5.855,5.855,0,1,0,11.71,0,5.737,5.737,0,0,0-1-3.23A5.768,5.768,0,0,0,56.19,36.31ZM50.33,46.64a3.86,3.86,0,0,1-3.85-3.86,3.722,3.722,0,0,1,.99-2.55v-.01l.01-.01a3.824,3.824,0,0,1,5.71,0v.01c.01,0,.01,0,.01.01a3.722,3.722,0,0,1,.99,2.55A3.862,3.862,0,0,1,50.33,46.64Zm3.44-8.59a4.889,4.889,0,0,0-.69-.42,1.618,1.618,0,0,0-.18-.1c-.24-.11-.49-.22-.75-.31a6.991,6.991,0,0,0-.79-.19l-.2-.03a5.69,5.69,0,0,0-.83-.07,5.554,5.554,0,0,0-.82.07l-.2.03a6.508,6.508,0,0,0-.79.19h-.01a7.038,7.038,0,0,0-.75.32.556.556,0,0,0-.17.09,4.285,4.285,0,0,0-.68.42h-.02a3.811,3.811,0,0,1-.41-1.74,3.855,3.855,0,0,1,7.71,0A3.819,3.819,0,0,1,53.77,38.05Z"></path> </g> </g></svg>;
const RolesIcon = () => <svg fill="currentColor" width="30px" height="30px" viewBox="0 0 52 52" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M38.3,27.2A11.4,11.4,0,1,0,49.7,38.6,11.46,11.46,0,0,0,38.3,27.2Zm2,12.4a2.39,2.39,0,0,1-.9-.2l-4.3,4.3a1.39,1.39,0,0,1-.9.4,1,1,0,0,1-.9-.4,1.39,1.39,0,0,1,0-1.9l4.3-4.3a2.92,2.92,0,0,1-.2-.9,3.47,3.47,0,0,1,3.4-3.8,2.39,2.39,0,0,1,.9.2c.2,0,.2.2.1.3l-2,1.9a.28.28,0,0,0,0,.5L41.1,37a.38.38,0,0,0,.6,0l1.9-1.9c.1-.1.4-.1.4.1a3.71,3.71,0,0,1,.2.9A3.57,3.57,0,0,1,40.3,39.6Z"></path> <circle cx="21.7" cy="14.9" r="12.9"></circle> <path d="M25.2,49.8c2.2,0,1-1.5,1-1.5h0a15.44,15.44,0,0,1-3.4-9.7,15,15,0,0,1,1.4-6.4.77.77,0,0,1,.2-.3c.7-1.4-.7-1.5-.7-1.5h0a12.1,12.1,0,0,0-1.9-.1A19.69,19.69,0,0,0,2.4,47.1c0,1,.3,2.8,3.4,2.8H24.9C25.1,49.8,25.1,49.8,25.2,49.8Z"></path> </g></svg>;
const SettingsIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" width="30px" height="30px"  xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z" ></path> </g></svg>;
const NotificationsIcon = () => <svg width="30px" height="30px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19.3399 14.49L18.3399 12.83C18.1299 12.46 17.9399 11.76 17.9399 11.35V8.82C17.9399 6.47 16.5599 4.44 14.5699 3.49C14.0499 2.57 13.0899 2 11.9899 2C10.8999 2 9.91994 2.59 9.39994 3.52C7.44994 4.49 6.09994 6.5 6.09994 8.82V11.35C6.09994 11.76 5.90994 12.46 5.69994 12.82L4.68994 14.49C4.28994 15.16 4.19994 15.9 4.44994 16.58C4.68994 17.25 5.25994 17.77 5.99994 18.02C7.93994 18.68 9.97994 19 12.0199 19C14.0599 19 16.0999 18.68 18.0399 18.03C18.7399 17.8 19.2799 17.27 19.5399 16.58C19.7999 15.89 19.7299 15.13 19.3399 14.49Z" ></path> <path d="M14.8297 20.01C14.4097 21.17 13.2997 22 11.9997 22C11.2097 22 10.4297 21.68 9.87969 21.11C9.55969 20.81 9.31969 20.41 9.17969 20C9.30969 20.02 9.43969 20.03 9.57969 20.05C9.80969 20.08 10.0497 20.11 10.2897 20.13C10.8597 20.18 11.4397 20.21 12.0197 20.21C12.5897 20.21 13.1597 20.18 13.7197 20.13C13.9297 20.11 14.1397 20.1 14.3397 20.07C14.4997 20.05 14.6597 20.03 14.8297 20.01Z" ></path> </g></svg>;
const JobApplication = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M24 6.84V5.39a2.2 2.2 0 0 0-2.2-2.2h-2.69l-.27-1.64A1.85 1.85 0 0 0 17 0h-3.63a1.85 1.85 0 0 0-1.83 1.55l-.27 1.64H8.58a2.2 2.2 0 0 0-2.2 2.2v1.45Zm-11-5a.35.35 0 0 1 .35-.29H17a.35.35 0 0 1 .35.29l.23 1.4h-4.8Zm2.94 6.5V9.8a.75.75 0 0 1-1.5 0V8.34H6.38v4.76a2.2 2.2 0 0 0 2.2 2.2H21.8a2.2 2.2 0 0 0 2.2-2.2V8.34Zm1.25 10.55l-3 1A.2.2 0 0 0 14 20a1.72 1.72 0 0 1-1.57 1H9a.43.43 0 0 1 0-.86h3.44a.86.86 0 0 0 0-1.72h-3A6.1 6.1 0 0 0 6 17.17H4.25a3.46 3.46 0 0 0-1.54.37L.12 18.83A.23.23 0 0 0 0 19v4.63a.21.21 0 0 0 .11.19a.22.22 0 0 0 .22 0l2.76-1.72a.88.88 0 0 1 .74-.1c8.56 2.89 5.7 2.9 15.35-2a.44.44 0 0 0 .08-.74a2.17 2.17 0 0 0-2.07-.37"/></svg>

const icons = {
  home: <HomeIcon />,
  products: <ProductIcon />,
  orders: <OrdersIcon />,
  customers: <CustomersIcon />,
  analytics: <AnalyticsIcon />,
  marketing: <MarketingIcon />,
  payments: <PaymentsIcon />,
  settings: <SettingsIcon />,
  roles: <RolesIcon />,
  notifications: <NotificationsIcon />,
  applications: <JobApplication />,
};

const navLinks = [
  { label: 'Dashboard', href: '/dashboard/home', icon: icons.home },
  { label: 'Products', href: '/dashboard/products', icon: icons.products },
  { label: 'Orders', href: '/dashboard/orders', icon: icons.orders },
  { label: 'Customers', href: '/dashboard/customers', icon: icons.customers },
  { label: 'Payments', href: '/dashboard/payments', icon: icons.payments },
  { label: 'Settings', href: '/dashboard/settings', icon: icons.settings },
  { label: 'Roles & Permissions', href: '/dashboard/roles', icon: icons.roles },
  { label: 'Activity & Notifications', href: '/dashboard/notifications', icon: icons.notifications },
  { label: 'Job Applications', href: '/dashboard/application', icon: icons.applications },
];

export default function DashSidebar() {
  const pathname = usePathname();
  const { theme } = useDashboardTheme();

  // Compute dynamic classes based on theme
  const sidebarClass = `${styles.sidebar} ${theme === 'dark' ? styles.dark : styles.light}`;

  return (
    <aside className={sidebarClass}>

      <nav className={styles.nav}>
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.activeLink : ''} ${theme === 'dark' ? styles.darkLink : styles.lightLink}`}
                >
                  <span className={styles.icon}>{link.icon}</span>
                  <span className={styles.linkText}>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <li>
          <div className={styles.back}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48"><defs><mask id="SVGt9zVddCE"><path fill="#555555" fill-rule="evenodd" stroke="#fff" stroke-linejoin="round" stroke-width="4" d="M44 40.836q-7.34-8.96-13.036-10.168t-10.846-.365V41L4 23.545L20.118 7v10.167q9.523.075 16.192 6.833q6.668 6.758 7.69 16.836Z" clip-rule="evenodd"/></mask></defs><path fill="#000" d="M0 0h48v48H0z" mask="url(#SVGt9zVddCE)"/></svg>
              <Link
              href="/"
                      >
              Back to Shop
                      </Link>
          </div>
          </li>
      </nav>
    </aside>
  );
}
