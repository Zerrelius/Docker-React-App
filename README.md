Dies ist eine eine kleine React App um Docker auszutesten und damit herum zu spielen.

___

Fragen vom 30.04.2025

● Was wird genau im Image gespeichert – Quellcode oder Build-Ergebnis?
    - Im Image wird das Build-Ergebnis gespeichert.

● Welche Rolle spielt nginx in diesem Kontext?
    - NGINX ist hierbei der Webserver um die Seite erreichbar zu machen über den Browser.

● Warum wird der Entwicklungsmodus (npm run dev) nicht für den Produktivbetrieb genutzt?
    - Weil der Entwicklungsmodus Dinge enthält die unnötig sind für die Produktion. Außerdem ist der Produktionsstand kompremiert während der Entwicklungsmodus das nicht ist.

● Was ist der Vorteil eines Containers gegenüber einem „lokalen Build“?
    - Der Container kann auf jedem Server laufen und läuft nicht nur auf dem System auf dem es entwickelt wurde.

___

Reflexion vom 02.05.2025

## Multi-Stage Build:
Was ist der Hauptvorteil eines Multi-Stage Builds (wie in deinem Dockerfile implementiert)
gegenüber einem einfachen Dockerfile, das alle Schritte in einer einzigen Stage ausführt?
Der Hauptvorteil an einem Multi-Stage Build ist, dass das Testing weniger Fehleranfällig ist und so direkt geprüft werden kann, ob es ausreichend konfiguriert ist um auf jeden System laufen zu können.
So wird es sauber ohne Artefakte und dergleichen gebildet und dank der .dockerignore werden keine Artefakte oder dergleichen mit deployt.

Warum ist der node_modules Ordner nicht im finalen Nginx Image enthalten, obwohl er für
den Build-Prozess im ersten Stage notwendig war? Erkläre, wie der Multi-Stage Build dies
ermöglicht.
Weil wir im finalen Nginx Image, nur die fertig gebuildete Applikation haben. Dort brauchen wir keine node_modules mehr, da die Anwendung final in Javascript, CSS und HTML umgewandelt wurde und keine Dependencies mehr braucht.

Beschreibe, wie das Docker-Layer-Caching bei diesem Multi-Stage Build genutzt wird,
insbesondere im Zusammenhang mit dem COPY package*.json Schritt.
Durch die vorherige Verwendung und kopieren der package*.json Dateien, verhindern wir, dass unser Image unnötig groß wird. So installieren wir auch die benötigten Dependencies mit den entsprechend aktuellsten stable Varianten und nicht, jene die wir lokal auf unserem System verwenden. Außerdem übertragen wir später erst den eigentlichen Applikations Code. Das sorgt dafür, dass die package*.json die sich deutlich seltener ändert, nicht immer wieder neu geladen werden muss, sondern einfach aus dem Cache abgerufen werden kann.

## Rolle des Webservers und der Anwendung:
Was wird genau im finalen Image gespeichert – der gesamte Quellcode, die
Build-Abhängigkeiten oder das reine Build-Ergebnis (statische Dateien)? Erkläre den
Unterschied zur ersten Stage.
Im finalen Image wird nur das reine Build-Ergebnis gespeichert. Wir übertragen nur den dist Ordner, der völlig frei von den Build ABhängigkeiten und dem gesamten Quellcode ist.
In der ersten Stage als Beispiel, nutzen und installieren wir Node-Modules um unsere Applikation zu builden, diese werden aber in den statischen Dateien überhaupt nicht mehr benötigt.

Welche Rolle spielt der Webserver (Nginx) in diesem Kontext der Containerisierung deiner
React-Anwendung? Warum ist eine spezielle Konfiguration für SPAs (wie React) auf einem
Webserver oft notwendig?
In unserem fall dient der NGINX als Webserver und Reverse-Proxy. Diese werden an das Backend, sofern eins vorhanden wäre, weitergeleitet. Außerdem liefert er unsere statischen Inhalte aus.

Warum wird der Entwicklungsmodus (npm run dev) nicht für den Produktivbetrieb im
Container genutzt?
Der Command "npm run dev" ist nur für die primäre Entwicklung gedacht. Er enthält zusätzliche Abhängigkeiten welche später einfach nicht mehr benötigt werden für die Statischen Dateien. So werden Sicherheitsrisiken und unnötig große Dateien einfach verhindert.

## Containerisierung und Betrieb:
Was ist der Hauptvorteil der Containerisierung deiner React-Anwendung mit Docker
(basierend auf dem Multi-Stage Build) im Vergleich zur Auslieferung der statischen Dateien
durch einen "lokalen Build" auf dem Server ohne Container? Nenne mindestens zwei
Vorteile (z.B. in Bezug auf Portabilität, Reproduzierbarkeit, Isolation).
Der größte Vorteil ist wohl die Reproduzierbarkeit und Portabilität. Somit kann das Produkt jederzeit auf jedem Server erneut ausgeliefert und einfach, und hoffentlich schnell, wieder deployt werden. So kann die Anwendung ganz einfach mithilfe einer standardisierten Umgebung deployt werden. Da Container außerdem Plattformunabhängig sind, ist der grundlegende Server in seiner Konfiguration egal.
Durch den Multi-Stage Build, kommt an ende auch nur eine sehr viel kleiner benötigte Anwendung heraus, welche unnötige Artefakte, unnötige Dateien und anderes nicht mitnimmt aus der Produktionsumgebung. So ist der finale Build ein schlankes Endergebnis.

Erkläre die Funktion des HEALTHCHECK in deinem Dockerfile und warum er für die spätere
Orchestrierung (z.B. in Docker Swarm oder Kubernetes) von Bedeutung ist.
Mithilfe des HEALTHCHECK Befehls, überprüft Docker bei der Erstellung der Stages, ob die Container richtig aufgesetzt wurden und die Applikation auch entsprechend gut erreichbar ist. Für Kubernetes oder Docker Swarm ist es dementsprechend relevant, da sie automatisiert später die Container restarten und Traffic umleiten. So können diese Orchester entsprechend überprüfen ob die Container auch richtig funktionieren und laufen oder sie gegebenenfalls neugestartet oder sogar gestoppt werden müssen.

Vergleiche die Aufgaben von .gitignore und .dockerignore in deinem Projekt. Welche Datei
beeinflusst den Git-Verlauf und welche den Docker Build-Kontext?
Den Docker Build-Kontext beeinflussen die package*.json Dateien.

___