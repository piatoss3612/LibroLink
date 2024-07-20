// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract BanFilter {
    error BanFilter__UserBanned(address user);

    mapping(address => bool) public bannedUsers;

    event BanStatusChanged(address indexed user, bool status);

    /**
     * @notice Check if the user is banned.
     * @param _user The user address.
     */
    function _requireNotBanned(address _user) internal view {
        if (bannedUsers[_user]) {
            revert BanFilter__UserBanned(_user);
        }
    }

    /**
     * @notice Check if the user is banned.
     * @param _user The user address.
     */
    function isBanned(address _user) external view returns (bool) {
        return bannedUsers[_user];
    }

    /**
     * @notice Set the ban status of a user.
     * @dev virtual function to allow overriding in derived contracts.
     * @param _user The user address.
     * @param _status The ban status.
     */
    function setBanStatus(address _user, bool _status) external virtual {
        _setBanStatus(_user, _status);
    }

    /**
     * @notice Set the ban status of a user.
     * @dev internal function to allow overriding in derived contracts.
     * @param _user The user address.
     * @param _status The ban status.
     */
    function _setBanStatus(address _user, bool _status) internal {
        bannedUsers[_user] = _status;
        emit BanStatusChanged(_user, _status);
    }
}
