import Link from "next/link"

const LandingPage = ({ currentUser, tickets }) => {

  const ticketList = tickets.map(ticket => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link className="nav-link" href={`/tickets/[ticketId]`} as={`/tickets/${ticket.id}`}>
            View
          </Link>
        </td>
      </tr>
    )
  })

  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
}

// here we are making request on the server
// if we were to make that axios call in the component, it would be a request from the browser
// since this is run inside of a client container, it's trying to make that request inside that container by localhost:80/api/users/currentUser
// LandingPage.getInitialprops = async () => {
//   const response = await axios.get('/api/users/currentuser');

//   return response.data;
// }


// getInitialProps is always exectued on the server except when navigating from one page to another withing the app
// req is same in like express
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
}

export default LandingPage;