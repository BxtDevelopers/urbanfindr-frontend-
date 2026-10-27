import './globals.css';
import { Providers } from '@/components/providers';
export const metadata={title:{default:'UrbanFindr — Find your kind of home',template:'%s | UrbanFindr'},description:'Homes, builder projects and thoughtful interiors. Connect directly with owners on UrbanFindr.'};
export default function RootLayout({children}){return <html lang="en"><body><Providers>{children}</Providers></body></html>;}
