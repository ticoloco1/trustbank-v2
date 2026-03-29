import { redirect } from 'next/navigation';
export default function CVPage() {
  redirect('/editor?tab=cv');
}
