import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { GetCurrentUserId, GetCurrentUserCompanyId } from 'src/app.common/decorators';
import {
  IGetCompanyDataResponse,
  GetCompanyDataResponseDto,
  IGetUserCompaniesResponse,
  GetUserCompaniesResponseDto,
  IStatusResponse,
  StatusResponseDto,
  EditCompanyRequestDto
} from './dto';

import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get('get-user-companies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user companies' })
  @ApiOkResponse({ description: 'Returns user companies information', type: GetUserCompaniesResponseDto })
  getUserCompanies(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number
  ): Promise<IGetUserCompaniesResponse> {
    return this.companyService.getUserCompanies(userId, currentCompanyId);
  }

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete company' })
  @ApiOkResponse({ description: 'Status of the action to delete company', type: StatusResponseDto })
  deleteCompany(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('companyId') companyId: number
  ): Promise<IStatusResponse> {
    return this.companyService.deleteUserCompany(userId, currentCompanyId, companyId)
  }

  @Get('data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get company data' })
  @ApiOkResponse({ description: 'Returns data of the company', type: GetCompanyDataResponseDto })
  getCompanyData(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('companyId') companyId: number
  ): Promise<IGetCompanyDataResponse> {
    return this.companyService.getCompanyData(userId, currentCompanyId, companyId)
  }

  @Post('change-current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current company' })
  @ApiOkResponse({ description: 'Change current company', type: StatusResponseDto })
  changeCurrentCompany(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Query('companyId', ParseIntPipe) companyId: number
  ): Promise<IStatusResponse> {
    return this.companyService.changeCurrentCompany(userId, currentCompanyId, companyId)
  }

  @Post('edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit or create company' })
  @ApiOkResponse({ description: 'Edit or create if id is empty company', type: StatusResponseDto })
  editCompany(
    @GetCurrentUserId() userId: number,
    @GetCurrentUserCompanyId() currentCompanyId: number,
    @Body() dto: EditCompanyRequestDto
  ): Promise<IStatusResponse> {
    return this.companyService.editCompany(userId, currentCompanyId, dto);
  }
}
