import './globals.css';
import { Providers } from '@/components/providers';
export const metadata={title:{default:'UrbanFindr — Find your kind of home',template:'%s | UrbanFindr'},description:'Homes, builder projects and thoughtful interiors. Connect directly with owners on UrbanFindr.'};
export default function RootLayout({children}){
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
