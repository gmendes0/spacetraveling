import { GetStaticProps, NextPage } from 'next';

import { getPrismicClient } from '../services/prismic';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import styles from './home.module.scss';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Head from 'next/head';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  async function handleLoadMorePosts() {
    setIsLoadingMore(true);

    try {
      const response = await fetch(posts.next_page);

      const responseData: PostPagination = await response.json();

      setPosts({
        next_page: responseData.next_page,
        results: [...posts.results, ...responseData.results],
      });
    } catch (error) {
      console.error(error);
    }

    setIsLoadingMore(false);
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>
      <main className={styles.container}>
        <ul>
          {posts.results.map(post => (
            <li className={styles.post} key={post.uid}>
              <h2 className={styles.title}>
                <Link href={`/post/${post.uid}`}>
                  <a>{post.data.title}</a>
                </Link>
              </h2>
              <p className={styles.subtitle}>{post.data.subtitle}</p>
              <div className={styles.info}>
                <time className={styles.infoItem}>
                  <FiCalendar />{' '}
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span className={styles.infoItem}>
                  <FiUser /> {post.data.author}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {posts.next_page && (
          <button
            type="button"
            className={styles.loadMore}
            onClick={handleLoadMorePosts}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Carregando...' : 'Carregar mais posts'}
          </button>
        )}
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 20 }
  );

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results,
      },
    },
    revalidate: 60 * 60 * 24 * 7,
  };
};
