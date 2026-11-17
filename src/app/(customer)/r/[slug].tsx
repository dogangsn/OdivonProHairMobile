import { Redirect, useLocalSearchParams } from 'expo-router';

/** Universal link https://hair.odivon.com/r/{slug} (and odivon://r/{slug}) → booking screen. */
export default function BookingLinkRedirect() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Redirect href={{ pathname: '/salon/[slug]', params: { slug } }} />;
}
