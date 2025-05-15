const handlePrismaError = (error) => {
  switch (error.code) {
    case 'P2002':
      return {
        status: 409,
        message: 'Ein Eintrag mit diesen Daten existiert bereits'
      };
    case 'P2025':
      return {
        status: 404,
        message: 'Eintrag nicht gefunden'
      };
    case 'P2000':
      return {
        status: 400,
        message: 'Ungültige Eingabedaten'
      };
    default:
      return {
        status: 500,
        message: 'Datenbankfehler'
      };
  }
};

module.exports = { handlePrismaError };