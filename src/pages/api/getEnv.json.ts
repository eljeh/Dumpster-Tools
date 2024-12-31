import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

export const GET: APIRoute = () => {
		const wbauth = getSecret('SECRET_WBAUTH');
		const wbbotid = getSecret('SECRET_WBBOTID');

		return new Response(
			JSON.stringify({ 
				wbauth: wbauth,
				wbbotid: wbbotid
			 })
		);

};	