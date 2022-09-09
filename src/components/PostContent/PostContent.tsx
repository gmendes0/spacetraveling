import { RichText } from 'prismic-dom';
import styles from './styles.module.scss';

type PostContentProps = {
  content: {
    heading: string;
    body: Array<{
      text: string;
    }>;
  };
};

export default function PostContent(props: PostContentProps) {
  return (
    <article className={styles.container}>
      <h2>{props.content.heading}</h2>
      <div
        dangerouslySetInnerHTML={{
          __html: RichText.asHtml(props.content.body),
        }}
      />
    </article>
  );
}
