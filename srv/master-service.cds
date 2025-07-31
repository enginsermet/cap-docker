using {dockerSampleApp.entities as db} from '../db/schema';

service MasterService {
    entity Authors as projection on db.Authors;
    entity Books as projection on db.Books;
    entity Genres as projection on db.Genres;


}