import { redirect } from 'next/navigation';
export default function VideosPage() {
  redirect('/editor?tab=videos');
}
