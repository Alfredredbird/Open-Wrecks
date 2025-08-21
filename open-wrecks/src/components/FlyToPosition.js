import { useMap } from "react-leaflet";

export default function FlyToPosition({ position, zoom }) {
  const map = useMap();
  if (position) map.flyTo(position, zoom, { duration: 1.5 });
  return null;
}
