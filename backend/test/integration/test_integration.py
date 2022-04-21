import pytest
import json, os
import pymongo

from src.util.dao import DAO

class WriteError(Exception):
    pass

@pytest.mark.integration
class TestDatabase:

    @pytest.fixture
    def sut(self):
        fabricatedFileName = './src/static/validators/test.json'
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
                        }
                    }
                }
            }
        with open(fabricatedFileName, 'w') as outfile:
            json.dump(self.json_string, outfile)

        # yield instead of return the system under test
        yield DAO(collection_name="test")

        # clean up the file after all tests have run
        os.remove(fabricatedFileName)

        #remove the collection
        myclient = pymongo.MongoClient("mongodb://localhost:27017/")
        mydb = myclient["edutask"]
        mycol = mydb["test"]

        mycol.drop()

    VALID_NAME = 'Jane'
    VALID_OBJ = {"name": VALID_NAME, "bool": True}

    def test_create_dict_return(self, sut):
        """
        If a valid data object is passed, a new entry is created and the object is returned.  
        """
        ret_val = sut.create(TestDatabase.VALID_OBJ)
        assert type(ret_val) == dict

    def test_create_name_correct(self, sut):
        """
        If a valid data object is passed, a new entry is created and the object is returned.  
        """
        ret_val = sut.create(TestDatabase.VALID_OBJ)
        assert ret_val["name"] == TestDatabase.VALID_NAME
    
    def test_create_Double(self, sut):
        """
        If a non-unique value is passed for uniqueItems field, a WriteError is raised.  
        """
        sut.create(TestDatabase.VALID_OBJ)
        with pytest.raises(WriteError):
            sut.create(TestDatabase.VALID_OBJ)