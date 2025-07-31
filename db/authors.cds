using { managed } from '@sap/cds/common';

using { dockerSampleApp.entities.Books as Books } from './books';


namespace dockerSampleApp.entities;

entity Authors : managed {
  key ID       : UUID;
  name         : String(111) @mandatory;
  dateOfBirth  : Date;
  dateOfDeath  : Date;
  placeOfBirth : String;
  placeOfDeath : String;
  books        : Association to many Books on books.author = $self;
}