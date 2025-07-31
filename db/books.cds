using {
    Currency,
} from '@sap/cds/common';

using {dockerSampleApp.entities.Authors as Authors} from './authors';
using {dockerSampleApp.entities.Genres as Genres} from './genres';


namespace dockerSampleApp.entities;

entity Books {
    key ID       : UUID;
        title    : localized String(111)   @mandatory;
        descr    : localized String(1111);
        author   : Association to Authors  @mandatory                @Common.Text           : author.name  @Common.TextArrangement: #TextOnly;
        genre    : Association to Genres   @Common.Text: genre.name  @Common.TextArrangement: #TextOnly;
        stock    : Integer;
        price    : Price;
        currency : Currency;
        image    : LargeBinary             @Core.MediaType: 'image/png';
}

type Price : Decimal(9, 2);


//Smart Table'da ilk açılışta gözükmesi için kolonlar belirtilir
annotate Books with @(UI: {LineItem: [
    {
        Value: ID,
        Label: 'ID'
    },
    {
        Value: title,
        Label: 'Title'
    },
    {
        Value: descr,
        Label: 'Description'
    },
    {
        Value: author_ID,
        Label: 'Author'
    },
    {
        Value: genre_ID,
        Label: 'Genre'
    },
    {
        Value: stock,
        Label: 'Stock'
    },
    {
        Value: currency_code,
        Label: 'Currency'
    },
], });

annotate Books with {
    ID @sap.updatable: false;
}

annotate Books with {
    author @(Common.ValueList: {
        Label         : 'Author',
        CollectionPath: 'Authors',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'author_ID',
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    });
    genre  @(Common.ValueList: {
        Label         : 'Genre',
        CollectionPath: 'Genres',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: 'genre_ID',
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name',
            }
        ]
    })
}
