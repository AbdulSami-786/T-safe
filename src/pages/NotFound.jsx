import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <section className="page wrap">
      <div className="empty card">
        <Icon name="search" />
        <h1>Page not found</h1>
        <p>The page you’re looking for doesn’t exist.</p>
        <Link className="btn btn-blue" to="/">Back to home</Link>
      </div>
    </section>
  );
}
