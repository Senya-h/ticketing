import { useEffect } from "react"
import useRequest from "../../hooks/use-request";
import Router from 'next/router';

// we need to sign out inside of a compnent (not getInitialProps), because in BE we are setting req.session to null and if server gets back that response, it doesnt do anything with it; the browser itself needs the response
export default () => {
  const { doRequest } = useRequest({
    method: 'post',
    url: '/api/users/signout',
    body: {},
    onSuccess: () => Router.push('/')
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>Signing you out...</div>
}