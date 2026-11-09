import Reviews from '../components/Reviews';
import usePageTitle from '../hooks/usePageTitle';

export default function ReviewsPage() {
  usePageTitle('Customer Reviews', 'See what T-Safe customers say about our toothbrushes and tongue cleaners, and share your own review.');
  return (
    <div className="page-reviews">
      <Reviews page />
    </div>
  );
}
