import axios from "axios";

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on server
    // we can create an external name service for this to simplify (remap) it
    // serviceName.nameSpace.svc.cluster.local
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    });
    // const { data } = await axios.get('/api/users/currentuser', {
    //   // headers: {
    //   //   Host: 'tickets.dev' // without this ngrx doesn't know what domain host to route to (we have described this in ingress-srv.yaml)
    //   // }
    //   headers: req.headers
    // });
  } else {
    // we are on browser
    // browser is including our cookie by default
    return axios.create({
      baseURL: '/'
    })
  }
}