import calendar
import logging
import datetime
from sqlalchemy.engine import create_engine, reflection
from sqlalchemy.orm.session import sessionmaker
from sqlalchemy.schema import MetaData, ForeignKeyConstraint, DropConstraint,\
    DropTable, Table
from sqlalchemy.sql.expression import and_
from zoearoundtheworld import model
from zoearoundtheworld import utils
from zoearoundtheworld.protocol import Protocol
import cmath

class Control(Protocol):

    _SESSION_EXTENSIONS_ = []
    _SESSION_KWARGS_ = {"autoflush":False}


    def __init__(self, db_url, echo=False, drop_all=False):
        '''
        Constructor
        '''
        self._clients = []
        self._pending = []

        logging.info("connecting to %s",db_url)
        params = dict(echo=echo)
        if 'mysql' in db_url:
            params['encoding']='utf-8'
            params['pool_recycle']=3600
            params['isolation_level']='READ COMMITTED'
        self._engine = create_engine(db_url, **params)
        self._Session = sessionmaker(bind=self._engine,
                                      extension=self._SESSION_EXTENSIONS_,
                                      **self._SESSION_KWARGS_)
        if drop_all is True:
            with self.session as session:
                self._drop_all_(session)
        self._create_all_()



    @property
    def session(self):
        '''
            returns a self closing session for use by with statements
        '''
        session = self._Session()
        class closing_session:
            def __enter__(self):
                return session
            def __exit__(self, _type, value, traceback):
                session.close()
        return closing_session()

    def _create_all_(self):
        model.Base.metadata.create_all(self._engine)  # @UndefinedVariable

    def _drop_all_(self, session):

        inspector = reflection.Inspector.from_engine(session.bind)

        # gather all data first before dropping anything.
        # some DBs lock after things have been dropped in
        # a transaction.

        metadata = MetaData()

        tbs = []
        all_fks = []

        for table_name in inspector.get_table_names():
            fks = []
            for fk in inspector.get_foreign_keys(table_name):
                if not fk['name']:
                    continue
                fks.append(
                    ForeignKeyConstraint((),(),name=fk['name'])
                    )
            t = Table(table_name,metadata,*fks)
            tbs.append(t)
            all_fks.extend(fks)

        for fkc in all_fks:
            session.execute(DropConstraint(fkc))

        for table in tbs:
            session.execute(DropTable(table))

        session.commit()

    def _flush(self, error = None):
        if not error:
            for message in self._pending:
                for client in self._clients:
                    client.broadcast(message)
        self._pending = []

    def _broadcast(self, message):
        self._pending.append(utils.dumps(message))

    def visited(self):
        with self.session as session:
            entries = session.query(model.Entry)
            visited = []
            for e in entries:
                if not (e.country in visited):
                    visited.append(e.country)
            return visited

    def new_entry(self, title, date, country, text):
        with self.session as session:
            entry = model.Entry(
                title=title,
                date=utils.parse_date(date),
                country=country,
                text=text
            )
            session.add(entry)
            session.commit()
            self._broadcast({"signal": "entried", "message":self.entry_to_json(entry)})


    def filter_entries(self, country):
        with self.session as session:
            entries = session.query(model.Entry).filter(model.Entry.country == country)
            entries = entries.order_by(model.Entry.date.desc())
            return [self.entry_to_json(e) for e in entries]






