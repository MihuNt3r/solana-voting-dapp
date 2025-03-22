'use client'

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardFeature() {
	const router = useRouter()

	useEffect(() => {
		// Redirect to votings page when the component mounts
		router.push('/solanavotingdapp')
	}, [router])

	return (
		<div>{"Rustcamp is awesome <3"}</div>
	)
}
