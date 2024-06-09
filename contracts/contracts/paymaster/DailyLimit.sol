// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

abstract contract DailyLimit {
    error DailyLimit__DailyLimitReached(address user);

    /**
     * @notice Structure used to track the daily limit for a user.
     */
    struct Tracker {
        uint128 counter;
        uint128 timestamp;
    }

    uint256 public dailyLimit;

    mapping(address => Tracker) public dailyLimitTracker;

    event DailyLimitSet(uint256 newLimit);

    /**
     * @notice Check the daily limit for a user.
     * @param _user The user address.
     * @return reset Whether the counter should be reset.
     * @return reached Whether the limit was reached.
     * @return counter The current counter value.
     */
    function checkDailyLimit(address _user) public view returns (bool reset, bool reached, uint128 counter) {
        uint256 current = block.timestamp;
        uint128 yesterday6am = uint128(((current - 1 days) / 1 days) * 1 days + 6 hours); // yesterday 6am UTC
        uint128 today6am = yesterday6am + 1 days; // today 6am UTC

        Tracker memory tracker = dailyLimitTracker[_user];

        if (
            (tracker.timestamp < today6am && current >= today6am)
                || (tracker.timestamp < yesterday6am && current < today6am)
        ) {
            // 1. If the last update was before today 6am and the current time is after today 6am,
            // 2. Or if the last update was before yesterday 6am and the current time is before today 6am, (in case the time is after midnight but before 6am)
            // the counter should be reset whether the limit was reached or not.
            reset = true;
        } else if (tracker.counter >= dailyLimit) {
            // If the counter reached the limit, the user should not be able to perform any more operations.
            reached = true;
        }

        // Return the current counter value.
        counter = tracker.counter;
    }

    /**
     * @notice Update the daily limit for a user.
     * @param _user The user address.
     */
    function _updateDailyLimit(address _user) internal {
        (bool reset, bool reached,) = checkDailyLimit(_user);

        // If the limit was reached, revert the transaction.
        if (reached) {
            revert DailyLimit__DailyLimitReached(_user);
        }

        Tracker storage tracker = dailyLimitTracker[_user];

        // If the counter should be reset, set it to 1 otherwise increment it.
        if (reset) {
            tracker.counter = 1;
        } else {
            tracker.counter++;
        }

        // Update the timestamp.
        tracker.timestamp = uint128(block.timestamp);
    }

    /**
     * @notice Set the daily limit.
     * @dev virtual function to allow overriding it in derived contracts.
     * @param _dailyLimit The new daily limit.
     */
    function setDailyLimit(uint256 _dailyLimit) external virtual {
        _setDailyLimit(_dailyLimit);
    }

    /**
     * @notice Set the daily limit.
     * @param _dailyLimit The new daily limit.
     */
    function _setDailyLimit(uint256 _dailyLimit) internal {
        dailyLimit = _dailyLimit;
        emit DailyLimitSet(_dailyLimit);
    }
}
