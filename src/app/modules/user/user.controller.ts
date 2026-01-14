import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { UserServices } from './user.service'
import sendResponse from '../../utils/sendResponse'



const createUser = catchAsync(async (req, res) => {
  const userData = req.body

  const result = await UserServices.createUser(userData)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is created successfully',
    data: result
  })
})




const changeUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params
  const { status } = req.body 

  const result = await UserServices.changeUserStatus(id, status)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status updated successfully',
    data: result,
  })
})

const changeUserRole = catchAsync(async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  const result = await UserServices.changeUserRole(id, role)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully',
    data: result,
  })
})






export const UserControllers = {
  createUser,
  changeUserStatus,
  changeUserRole
}

