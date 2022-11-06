import Head from 'next/head'
import * as React from 'react'
import fetch from 'cross-fetch'
import styles from '../styles/Home.module.css'
import { server } from '../config';
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

export default function Blog({ posts }: { posts: any }) {
	function reformatDate(fullDate: any) {
		const date = new Date(fullDate);
		return date.toDateString().slice(4);
	}

	return (
		<div className={styles.container_blog}>
			<Head>
				<title>{posts.attributes.title}</title>
			</Head>
			
			<main className={styles.main_blog}>
				<div className={[styles.split, styles.left].join(" ")}>
					<div className={styles.centered}>
						<h1 className={styles.title}>{posts.attributes.title}</h1>
						<p className={styles.descriptionleft}>by {posts.attributes.author}</p>

						<p className={styles.back}>
							<Link href="/">&larr; Go back</Link>
						</p>
					</div>
				</div>

				<div className={[styles.split, styles.right].join(" ")}>
					<div className={styles.centered}>
						<ReactMarkdown>{`${posts.attributes.body}`}</ReactMarkdown>
					</div>
				</div>
			</main>
		</div>
	)
}

export async function getStaticProps({ ...ctx }) {
	let pageData = [];

	const client = new ApolloClient({
		link: new HttpLink({ uri: `${server}/graphql`, fetch }),
		cache: new InMemoryCache()
	});

	const { data } = await client.query({
		query: gql`
		query {
			posts {
				data {
					attributes {
						author
						date
						slug
						body
						title
					}
				}
			}
		}`
	});

	for (let index = 0; index < data.posts.data.length; index++) {
		if (data.posts.data[index].attributes.slug === ctx.params.slug) {
			pageData = data.posts.data[index];
		}
	}

	return {
		props: {
			posts: pageData
		}
	}
}

export async function getStaticPaths() {
	const client = new ApolloClient({
		link: new HttpLink({ uri: `${server}/graphql`, fetch }),
		cache: new InMemoryCache()
	});

	const { data } = await client.query({
		query: gql`
		query {
			posts {
				data {
					attributes {
						author
						slug
					}
				}
			}
		}`
	});

	const paths = data.posts.data.map((post: any) => ({
		params: {
			slug: post.attributes?.slug,
			posts: post.attributes
		}
	}));

	return {
		paths,
		fallback: false
	}
}