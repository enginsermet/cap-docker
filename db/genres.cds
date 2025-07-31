using { sap } from '@sap/cds/common';

namespace dockerSampleApp.entities;

entity Genres {
  key ID   : UUID;
  name     : String;
}