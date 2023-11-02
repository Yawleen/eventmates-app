import moment from "moment";
import jwt_decode from "jwt-decode";


export const autoLogOut = (authToken, setIsSignedIn) => {
  const token = jwt_decode(authToken);
  const expiryDate = moment(new Date(token.exp * 1000));
  const currDate = moment(new Date());

  setTimeout(
    () => setIsSignedIn(false),
    expiryDate.diff(currDate, "milliseconds")
  );
};
