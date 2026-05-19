
interface Props {
  _nanoseconds: number
  _seconds: number
}

function formatFirebaseDate(firebaseDate: Props, mostrarSoloFecha?: boolean) {
  const date = new Date(firebaseDate._seconds * 1000);

  const utc6Time = new Date(date.getTime() - 6 * 60 * 60 * 1000);

  return mostrarSoloFecha ?
    utc6Time.toLocaleString('es-HN', {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    : utc6Time.toLocaleString('es-HN', {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
}

export default formatFirebaseDate;
