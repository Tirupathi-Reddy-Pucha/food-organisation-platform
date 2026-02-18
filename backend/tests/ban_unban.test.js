import { checkAndApplyBan, checkBanCriteria } from '../utils/banCheck.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';
import { jest } from '@jest/globals';

// Replace model methods with jest spies so we can control behavior
FoodListing.aggregate = jest.fn();
FoodListing.find = jest.fn();
User.findByIdAndUpdate = jest.fn();

describe('Ban/Unban flow (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('bans when last 3 ratings are below threshold', async () => {
    const donorId = '507f1f77bcf86cd799439011';

    // avg ok
    FoodListing.aggregate.mockResolvedValue([{ avgRating: 3 }]);

    // chainable find -> sort -> limit -> select returning 3 low ratings
    const selectMock = jest.fn().mockResolvedValue([{ rating: 1 }, { rating: 1.5 }, { rating: 1 }]);
    const limitMock = jest.fn().mockReturnValue({ select: selectMock });
    const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
    FoodListing.find.mockReturnValue({ sort: sortMock });

    await checkAndApplyBan(donorId);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(donorId, expect.objectContaining({ isBanned: true }));
  });

  test('bans when average rating < 2.0', async () => {
    const donorId = '507f191e810c19729de860ea';

    // avg low
    FoodListing.aggregate.mockResolvedValue([{ avgRating: 1.6 }]);

    // ensure recent ratings path not causing ban before avg check
    const selectMock = jest.fn().mockResolvedValue([]);
    const limitMock = jest.fn().mockReturnValue({ select: selectMock });
    const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
    FoodListing.find.mockReturnValue({ sort: sortMock });

    await checkAndApplyBan(donorId);

    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(donorId, expect.objectContaining({ isBanned: true }));
  });
});
