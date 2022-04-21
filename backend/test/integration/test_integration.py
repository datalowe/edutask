import pytest
import json, os
import pymongo

from pymongo.errors import WriteError as PMWriteError, ConnectionFailure as PMConnectionFailure

from unittest.mock import patch, MagicMock

from src.util.dao import DAO


TEST_COLLECTION_NAME = "test"

VALID_NAME1 = 'Jane'
VALID_NAME2 = 'Breonna'

VALID_OBJ1 = {"name": VALID_NAME1, "bool": True, "bool2": True}
VALID_OBJ2 = {"name": VALID_NAME1, "bool": True, "bool2": False}
VALID_OBJ3 = {"name": VALID_NAME2, "bool": True, "bool2": True}
VALID_OBJ4 = {"name": VALID_NAME2, "bool": True, "bool2": False}
VALID_OBJ_ONLYREQUIRED = {"name": VALID_NAME1, "bool": True}
INVALID_BOOLS_OBJ = {"name": VALID_NAME1, "bool": "inv_bool", "bool2": "inv_bool"}
INVALID_INCOMPLETE_OBJ = {"name": VALID_NAME1}


@pytest.mark.integration
class TestDatabase:

    @pytest.fixture
    def sut(self):
        fabricated_file_path = f'./src/static/validators/{TEST_COLLECTION_NAME}.json'
        self.json_string = {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["name", "bool"],
                "properties": {
                    "name": {
                        "bsonType": "string",
                        "description": "user's name",
                        "uniqueItems": True
                    },
                    "bool" : {
                        "bsonType": "bool",
                        "description": "true or false"
                    },
                    "bool2": {
                        "bsonType": "bool",
                        "description": "true or false 2",
                        "uniqueItems": True
                    }
                }
            }
        }
        with open(fabricated_file_path, 'w') as outfile:
            json.dump(self.json_string, outfile)

        # yield instead of return the system under test
        yield DAO(collection_name=TEST_COLLECTION_NAME)

        # clean up the file after all tests have run
        os.remove(fabricated_file_path)

        #remove the collection
        myclient = pymongo.MongoClient("mongodb://localhost:27017/")
        mydb = myclient["edutask"]
        mycol = mydb["test"]

        mycol.drop()
        myclient.close()
    
    @pytest.fixture
    @patch('pymongo.MongoClient')
    def sut_dbconnfailonwrite(self, mocked_MongoClient):
        mock_collection = MagicMock()
        mock_collection.insert_one.side_effect = PMConnectionFailure

        mock_db = MagicMock()
        mock_db.list_collection_values.return_value = [TEST_COLLECTION_NAME]
        mock_db.__getitem__.return_value = mock_collection
        mocked_MongoClient.return_value.edutask = mock_db
        return DAO(collection_name=TEST_COLLECTION_NAME)

    def test_create_dict_return(self, sut):
        """
        If a valid data object is passed, a new entry is created and the object is returned.  
        """
        ret_val = sut.create(VALID_OBJ1)
        assert type(ret_val) == dict

    def test_create_name_correct(self, sut):
        """
        If a valid data object is passed, a new entry is created and the object is returned.  
        """
        ret_val = sut.create(VALID_OBJ1)
        assert ret_val["name"] == VALID_NAME1
    
    @pytest.mark.parametrize(
        "obj1,obj2,should_raise_error",
        [
            (VALID_OBJ1, VALID_OBJ2, True),
            (VALID_OBJ1, VALID_OBJ3, True),
            (VALID_OBJ1, VALID_OBJ4, False),
        ]
    )
    def test_create_duplicated_uniqueitems(self, obj1, obj2, should_raise_error, sut):
        """
        If a non-unique value is passed for uniqueItems string field or uniqueItems bool field,
        a WriteError is raised.
        """
        sut.create(obj1)
        if should_raise_error:
            with pytest.raises(PMWriteError):
                sut.create(obj2)
        else:
            try:
                sut.create(obj2)
            except PMWriteError:
                pytest.fail("Duplicate non-uniqueitem field values caused unexpected write error.")
    
    def test_create_invalidbool(self, sut):
        """
        Upon attempt to create an object with non-valid boolean values, a WriteError is
        thrown (bubbled up).
        """
        with pytest.raises(PMWriteError):
            sut.create(INVALID_BOOLS_OBJ)
    
    def test_create_incomplete(self, sut):
        """
        Upon attempt to create an object not having values for all required field, a WriteError is
        thrown (bubbled up).
        """
        with pytest.raises(PMWriteError):
            sut.create(INVALID_INCOMPLETE_OBJ)

    def test_create_onlyrequired(self, sut):
        """
        When creating object with all required, but not all optional, fields filled out,
        a new entry is created and a Python representation of it is returned.
        """
        ret_val = sut.create(VALID_OBJ_ONLYREQUIRED)
        assert ret_val["name"] == VALID_OBJ_ONLYREQUIRED["name"]

    def test_create_connectionlost(self, sut_dbconnfailonwrite):
        """
        If pymongo throws a ConnectionFailure error (db connection lost) when trying to
        write to db, this error is bubbled up.
        """
        with pytest.raises(PMConnectionFailure):
            sut_dbconnfailonwrite.create(VALID_OBJ1)