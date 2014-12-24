from sqlalchemy.types import String, Integer, Numeric, DateTime, Date, Time, Enum, Boolean, Text
from sqlalchemy.schema import Table, Column, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative.api import declared_attr, has_inherited_table, declarative_base
import re


#see: http://docs.sqlalchemy.org/en/rel_0_8/orm/extensions/declarative.html#augmenting-the-base

class _Base_(object):
    ''' provides default tablename and table_args properties'''

    __table_args__ = {'mysql_engine': 'InnoDB'}

    @declared_attr
    def __tablename__(self):
        if has_inherited_table(self):
            return None
        name = self.__name__
        return (name[0].lower() +
            re.sub(r'([A-Z])', lambda m:'_' + m.group(0).lower(), name[1:]))

Base = declarative_base(cls=_Base_)


class Entry(Base):

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    date = Column(DateTime)
    country = Column(String(255))
    text = Column(Text)

