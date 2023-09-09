import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// this is used as a HOC by default for all pages
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  )
}

// getInitialProps is always exectued on the server except when navigating from one page to another withing the app
// arguments provided here for a custom component are different than for pages
AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);

  const { data } = await client.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
  // when we are using getInitialProps inside of a custom component, the page we are trying to render no longer automatically calls getInitialProps so we have to do it manually (just how NextJs works)
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  return {
    pageProps,
    ...data
  };
}

export default AppComponent;
