Dies ist eine eine kleine React App um Docker auszutesten und damit herum zu spielen.

● Was wird genau im Image gespeichert – Quellcode oder Build-Ergebnis?
    - Im Image wird das Build-Ergebnis gespeichert.

● Welche Rolle spielt nginx in diesem Kontext?
    - NGINX ist hierbei der Webserver um die Seite erreichbar zu machen über den Browser.

● Warum wird der Entwicklungsmodus (npm run dev) nicht für den Produktivbetrieb genutzt?
    - Weil der Entwicklungsmodus Dinge enthält die unnötig sind für die Produktion. Außerdem ist der Produktionsstand kompremiert während der Entwicklungsmodus das nicht ist.

● Was ist der Vorteil eines Containers gegenüber einem „lokalen Build“?
    - Der Container kann auf jedem Server laufen und läuft nicht nur auf dem System auf dem es entwickelt wurde.
