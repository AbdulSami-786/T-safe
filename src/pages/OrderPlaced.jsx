import { Link, useLocation, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { rs } from '../utils/format';
import usePageTitle from '../hooks/usePageTitle';

export default function OrderPlaced() {
  usePageTitle('Order placed');
  const { id } = useParams();
  const { state } = useLocation();

  return (
    <section className="page wrap">
      <div className="done-card card">
        <span className="done-ico"><Icon name="check" /></span>
        <span className="stk">Order received</span>
        <h1 className="h-xl">Thank <mark>you!</mark></h1>
        <p className="lead-p">Your order <b className="order-id">#{id}</b> has been placed{state?.total ? <> for <b>{rs(state.total)}</b></> : ''}.</p>

        <ol className="steps-list">
          <li><b>1</b> We check your payment proof (usually within a few hours).</li>
          <li><b>2</b> Once verified, we pack your order and hand it to the courier.</li>
          <li><b>3</b> Your order arrives in <b>5 to 8 days</b>. Track every step with your Order ID and phone number.</li>
        </ol>

        <p className="muted">Save your Order ID — you’ll need it to track your delivery.</p>
        <div className="row-btns center">
          <Link className="btn btn-blue" to={`/track?order=${id}&phone=${state?.phone || ''}`}>Track this order <Icon name="box" /></Link>
          <Link className="btn btn-white" to="/">Continue shopping</Link>
        </div>
      </div>
    </section>
  );
}
