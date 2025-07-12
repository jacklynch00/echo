'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink } from '@/components/ui/breadcrumb';
import AddPersonModal from '@/src/components/AddPersonModal';

export default function CreatePersonPage() {
	const [isModalOpen, setIsModalOpen] = useState(true);
	const router = useRouter();

	const handleClose = () => {
		setIsModalOpen(false);
		router.push('/dashboard');
	};

	const handlePersonAdded = () => {
		setIsModalOpen(false);
		router.push('/dashboard');
	};

	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
				<div className='flex items-center gap-2 px-4'>
					<SidebarTrigger className='-ml-1' />
					<Separator orientation='vertical' className='mr-2 h-4' />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbItem>
								<BreadcrumbPage>Create Person</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>
			<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
				<div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-8'>
					<div className='mx-auto max-w-2xl text-center'>
						<h1 className='text-3xl font-bold tracking-tight mb-4'>Create a New Person</h1>
						<p className='text-lg text-muted-foreground mb-8'>Preserve the memory of a loved one by uploading their voice sample.</p>
					</div>
				</div>
			</div>

			<AddPersonModal isOpen={isModalOpen} onClose={handleClose} onPersonAdded={handlePersonAdded} />
		</>
	);
}
