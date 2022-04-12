import pytest
import unittest.mock as mock

from src.controllers.usercontroller import UserController
from src.util.dao import DAO

@pytest.mark.unit
class TestGetUserByEmail:
    VALID_EMAIL = 'foo@bar.com'
    VALID_EMAIL_MATCHUSER1 = {
        '_id': '1',
        'firstName': 'Foo',
        'lastName': 'Bar',
        'email': VALID_EMAIL
    }
    VALID_EMAIL_MATCHUSER2 = {
        '_id': '2',
        'firstName': 'Baz',
        'lastName': 'Qux',
        'email': VALID_EMAIL
    }

    def test_getuserbyemail_invalidemail(self):
        """
        If invalid e-mail is passed, ValueError is raised.
        """
        dao_mock: mock.Mock = mock.MagicMock()
        uc: UserController = UserController(dao_mock)
        with pytest.raises(ValueError):
            uc.get_user_by_email('foobar.com')
    
    def test_getuserbyemail_nomatchuser(self):
        """
        If valid e-mail is passed, but there is no matching user found, 
        None is returned.
        """
        dao_mock: mock.Mock = mock.Mock(DAO)
        dao_mock.find.return_value = []
        uc: UserController = UserController(dao_mock)
        ret_val = uc.get_user_by_email(TestGetUserByEmail.VALID_EMAIL)
        assert ret_val is None
    
    @pytest.mark.unit
    def test_getuserbyemail_dbdown(self):
        """
        If valid e-mail is passed, but the database connection is broken (ie
        DAO instance throws an exception), an exception is thrown.
        """
        dao_mock: mock.Mock = mock.Mock(DAO)
        dao_mock.find.side_effect = Exception('DB down')
        uc: UserController = UserController(dao_mock)
        with pytest.raises(Exception):
            ret_val = uc.get_user_by_email(TestGetUserByEmail.VALID_EMAIL)

    def test_getuserbyemail_2matchuser(self):
        """
        If valid e-mail is passed and there are 2 matching users found, 
        the first of these users (dict) is returned.
        """
        dao_mock: mock.Mock = mock.Mock(DAO)
        dao_mock.find.return_value = [
            TestGetUserByEmail.VALID_EMAIL_MATCHUSER1,
            TestGetUserByEmail.VALID_EMAIL_MATCHUSER2
        ]
        uc: UserController = UserController(dao_mock)
        ret_val = uc.get_user_by_email(TestGetUserByEmail.VALID_EMAIL)
        assert ret_val is TestGetUserByEmail.VALID_EMAIL_MATCHUSER1

    def test_getuserbyemail_1matchuser(self):
        """
        If valid e-mail is passed and there is 1 matching user found, 
        the user (dict) is returned.
        """
        dao_mock: mock.Mock = mock.Mock(DAO)
        dao_mock.find.return_value = [TestGetUserByEmail.VALID_EMAIL_MATCHUSER1]
        uc: UserController = UserController(dao_mock)
        ret_val = uc.get_user_by_email(TestGetUserByEmail.VALID_EMAIL)
        assert ret_val is TestGetUserByEmail.VALID_EMAIL_MATCHUSER1
