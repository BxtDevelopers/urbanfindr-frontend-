import { notFound } from 'next/navigation';
import Application from '@/components/application';
import { cityFor } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export async function generateMetadata({params}) { const {slug} = await params; const city=cityFor(slug); return { title: city ? `Properties in ${city.name}` : 'City not found' }; }
export default async function Page({params}) { const {slug}=await params;if(!cityFor(slug))notFound();return <Application />; }
