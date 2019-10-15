#include <SPI.h>
#include <Ethernet.h>
#include "aWOT.h"
#include "StaticFiles.h"

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
EthernetServer server(80);
Application app;

void setup() {
  Serial.begin(115200);

  while (!Ethernet.begin(mac)) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(Ethernet.localIP());

  app.route(staticFiles());

  server.begin();
}

void loop() {
  EthernetClient client = server.available();

  if (client.connected()) {
    app.process(&client);
  }
}
