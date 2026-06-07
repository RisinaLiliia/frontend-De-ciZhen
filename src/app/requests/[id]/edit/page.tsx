import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestEditRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/requests/${id}?edit=1`);
}
