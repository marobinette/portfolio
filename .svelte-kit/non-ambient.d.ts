
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/papers" | "/api/papers/[id]" | "/blog" | "/blog/master-equations" | "/papers" | "/research";
		RouteParams(): {
			"/api/papers/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/api": { id?: string };
			"/api/papers": { id?: string };
			"/api/papers/[id]": { id: string };
			"/blog": Record<string, never>;
			"/blog/master-equations": Record<string, never>;
			"/papers": Record<string, never>;
			"/research": Record<string, never>
		};
		Pathname(): "/" | "/api/papers" | `/api/papers/${string}` & {} | "/blog" | "/blog/master-equations" | "/papers" | "/research";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/vcsi-logo.png" | string & {};
	}
}