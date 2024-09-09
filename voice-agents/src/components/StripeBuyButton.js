import React, { useEffect } from 'react';

const StripeBuyButton = ({ onSuccess, buttonText, amount }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    script.onload = () => {
      if (window.StripeBuyButton) {
        window.StripeBuyButton.mount({
          buyButtonId: 'buy_btn_1PgqzrC2V7EgrEqh3nKA9HYG',
          publishableKey: 'pk_test_51LPO6YC2V7EgrEqhd4meapy6I4LDOX0PWoMeedAHxBDYiF6A1usEP3UpKq3YbD4MX59GQ7Lnxr9WCg8HkCx1BxU800sJCpv012',
          onComplete: (event) => {
            if (event.type === 'purchase-complete') {
              onSuccess();
            }
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [onSuccess]);

  return (
    <div>
      <stripe-buy-button
        buy-button-id="buy_btn_1PgqzrC2V7EgrEqh3nKA9HYG"
        publishable-key="pk_test_51LPO6YC2V7EgrEqhd4meapy6I4LDOX0PWoMeedAHxBDYiF6A1usEP3UpKq3YbD4MX59GQ7Lnxr9WCg8HkCx1BxU800sJCpv012"
      >
        {buttonText}
      </stripe-buy-button>
    </div>
  );
};

export default StripeBuyButton;
