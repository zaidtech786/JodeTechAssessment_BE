import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import ExcelJS from "exceljs"
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('generate-users')
  async generateUsers(@Body('total') total: number) {
    await this.userService.generateUsers(total);
  }

 @Get('get-users')
fetchUsers(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Query('date') date?: string, 
) {
  const parsedDate = date ? new Date(date) : undefined;
  return this.userService.fetchUsers(Number(page), Number(limit), parsedDate);
}

@Get('get-all-users')
getAllUsers(@Query('date') date?: string) {
  return this.userService.fetchAllUsers(date);
}


// user.controller.ts
@Get('download-users')
async downloadUsers(@Res() res: Response, @Query('date') date?: string) {
  const users = await this.userService.getUsersForExcel(date);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');

  worksheet.columns = [
    { header: 'ID', key: '_id', width: 25 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Created At', key: 'createdAt', width: 25 },
    { header: 'Updated At', key: 'updatedAt', width: 25 },
  ];

  users.forEach(user => {
    worksheet.addRow({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: new Date(user.createdAt).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
      updatedAt: new Date(user.updatedAt).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      }),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');

  return res.send(buffer); // ✅ Fixed: no more `res.end()` error
}



}
